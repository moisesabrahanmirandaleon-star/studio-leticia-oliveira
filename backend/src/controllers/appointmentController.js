import prisma from '../config/prisma.js';
import { validateSlotAvailability } from '../services/availabilityService.js';
import { whatsappService } from '../services/whatsappService.js';
import { calendarSyncService } from '../services/calendarSyncService.js';
import { emailService } from '../services/emailService.js';
import { pushNotificationService } from '../services/pushNotificationService.js';
import { formatPhoneDisplay } from '../utils/phoneUtils.js';

// Central de conexões em tempo real (Server-Sent Events)
const sseClients = new Set();

export function streamAppointments(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);

  // Mensagem inicial de handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

  // Heartbeat periódico (a cada 25s) para impedir corte por proxies de nuvem
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
}

export function broadcastSSE(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

export async function createAppointment(req, res) {
  try {
    const {
      clientName,
      clientPhone,
      clientEmail,
      stylistId,
      serviceId,
      date,
      startTime,
      paymentMethod = 'PRESENCIAL',
      notes
    } = req.body;

    if (!clientName || !clientPhone || !stylistId || !serviceId || !date || !startTime) {
      return res.status(400).json({
        error: 'Nome do cliente, WhatsApp, profissional, serviço, data e horário são obrigatórios.'
      });
    }

    // 1. Obter serviço para recuperar duração e nome
    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) }
    });

    if (!service || !service.active) {
      return res.status(404).json({ error: 'Serviço não encontrado ou inativo.' });
    }

    // 2. Obter profissional
    const stylist = await prisma.stylist.findUnique({
      where: { id: Number(stylistId) }
    });

    if (!stylist || !stylist.active) {
      return res.status(404).json({ error: 'Profissional não encontrada ou inativa.' });
    }

    // 3. Validar disponibilidade do horário
    const validation = await validateSlotAvailability({
      stylistId: stylist.id,
      date,
      startTime,
      durationMinutes: service.durationMinutes
    });

    if (!validation.valid) {
      return res.status(409).json({ error: validation.message });
    }

    const endTime = validation.endTime;

    // Normalizar telefone com DDI Brasil (+55) garantido
    const formattedClientPhone = formatPhoneDisplay(clientPhone);

    // 4. Salvar agendamento
    const appointment = await prisma.appointment.create({
      data: {
        clientName: clientName.trim(),
        clientPhone: formattedClientPhone,
        clientEmail: clientEmail?.trim() || null,
        stylistId: stylist.id,
        serviceId: service.id,
        date,
        startTime,
        endTime,
        status: 'CONFIRMADO',
        paymentMethod: paymentMethod === 'ONLINE' ? 'ONLINE' : 'PRESENCIAL',
        notes: notes?.trim() || null
      },
      include: {
        stylist: true,
        service: true
      }
    });

    // 5. Disparar notificação modular via WhatsApp
    const waNotification = await whatsappService.notifyNewAppointment({
      clientName: appointment.clientName,
      serviceName: appointment.service.name,
      durationMinutes: appointment.service.durationMinutes,
      date: appointment.date,
      startTime: appointment.startTime,
      clientPhone: appointment.clientPhone,
      paymentMethod: appointment.paymentMethod,
      stylistPhone: stylist.phone
    });

    // 5.1 Disparar notificação por E-mail para a Dona do Studio
    emailService.notifyNewAppointment({
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      clientEmail: appointment.clientEmail,
      serviceName: appointment.service.name,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      paymentMethod: appointment.paymentMethod,
      notes: appointment.notes,
      price: appointment.service.price
    }).catch(err => console.error('Erro ao disparar email de notificação:', err.message));

    // 5.2 Disparar Notificação Instantânea Web Push para o Android e PC da dona
    const cleanDt = String(appointment.date).split('T')[0].split('-').reverse().join('/');
    pushNotificationService.sendNotificationToAll({
      title: `✨ Novo Agendamento: ${appointment.clientName}`,
      body: `${appointment.service.name} em ${cleanDt} às ${appointment.startTime}`,
      url: '/admin',
      tag: `appointment-${appointment.id}`
    }).catch(err => console.error('Erro ao disparar push notification:', err.message));

    // 5.3 Notificação Instantânea em Tempo Real (SSE) para telas abertas da administradora
    broadcastSSE({
      type: 'NEW_APPOINTMENT',
      appointment
    });

    // 6. Gerar o aviso oficial de agendamento e política de 24h para a cliente
    const clientNoticeMessage = whatsappService.formatClientNoticeMessage({
      date: appointment.date,
      startTime: appointment.startTime,
      clientName: appointment.clientName,
      serviceName: appointment.service.name,
      stylist
    });

    const clientWhatsAppUrl = whatsappService.generateClickToChatUrl(
      appointment.clientPhone,
      clientNoticeMessage
    );

    const studioWhatsAppUrl = whatsappService.generateClickToChatUrl(
      stylist.phone || '5551995037223',
      clientNoticeMessage
    );

    const googleCalendarUrl = whatsappService.generateGoogleCalendarUrl({
      clientName: appointment.clientName,
      serviceName: appointment.service.name,
      durationMinutes: appointment.service.durationMinutes,
      date: appointment.date,
      startTime: appointment.startTime,
      clientPhone: appointment.clientPhone
    });

    // 7. Sincronização automática em tempo real com Google Calendar
    const calendarSyncResult = await calendarSyncService.syncAppointment({
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      serviceName: appointment.service.name,
      durationMinutes: appointment.service.durationMinutes,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime
    }).catch(err => {
      console.error('Erro calendarSync:', err.message);
      return { synced: false, error: err.message };
    });

    return res.status(201).json({
      message: 'Agendamento confirmado com sucesso!',
      appointment,
      googleCalendarUrl,
      clientNoticeMessage,
      clientWhatsAppUrl,
      policy: {
        hoursAdvanceNotice: 24,
        lateFeePercentage: 50,
        summary: 'Cancelamentos ou remarcações devem ser realizados com 24h de antecedência. Após esse prazo ou em caso de não comparecimento, será cobrado 50% do valor do procedimento.'
      },
      whatsapp: {
        sent: waNotification.success,
        directUrl: waNotification.whatsappUrl,
        clientUrl: clientWhatsAppUrl,
        studioUrl: studioWhatsAppUrl,
        noticeMessage: clientNoticeMessage
      }
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return res.status(500).json({ error: 'Erro ao processar agendamento.' });
  }
}

export async function listAppointments(req, res) {
  try {
    const { date, startDate, endDate, status, stylistId } = req.query;

    const where = {};

    if (date) {
      where.date = date;
    } else if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }

    if (status) {
      where.status = status;
    }

    if (stylistId) {
      where.stylistId = Number(stylistId);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        stylist: true,
        service: true
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return res.json(appointments);
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    return res.status(500).json({ error: 'Erro ao listar agendamentos.' });
  }
}

export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status inválido. Use: ${validStatuses.join(', ')}` });
    }

    const updated = await prisma.appointment.update({
      where: { id: Number(id) },
      data: { status },
      include: { stylist: true, service: true }
    });

    return res.json({ message: `Status alterado para ${status}.`, appointment: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar status do agendamento.' });
  }
}

export async function rescheduleAppointment(req, res) {
  try {
    const { id } = req.params;
    const { date, startTime } = req.body;

    if (!date || !startTime) {
      return res.status(400).json({ error: 'Nova data e novo horário são obrigatórios.' });
    }

    const current = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: { service: true }
    });

    if (!current) {
      return res.status(404).json({ error: 'Agendamento não encontrado.' });
    }

    // Validar novo slot
    const validation = await validateSlotAvailability({
      stylistId: current.stylistId,
      date,
      startTime,
      durationMinutes: current.service.durationMinutes,
      excludeAppointmentId: current.id
    });

    if (!validation.valid) {
      return res.status(409).json({ error: validation.message });
    }

    const updated = await prisma.appointment.update({
      where: { id: Number(id) },
      data: {
        date,
        startTime,
        endTime: validation.endTime,
        status: 'CONFIRMADO'
      },
      include: { stylist: true, service: true }
    });

    return res.json({ message: 'Agendamento remarcado com sucesso!', appointment: updated });
  } catch (error) {
    console.error('Erro ao reagendar:', error);
    return res.status(500).json({ error: 'Erro ao reagendar.' });
  }
}

export async function deleteAppointment(req, res) {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({
      where: { id: Number(id) }
    });
    return res.json({ message: 'Agendamento excluído com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir agendamento.' });
  }
}
