import prisma from '../config/prisma.js';
import { getAvailableSlots } from '../services/availabilityService.js';

export async function getStylistSchedule(req, res) {
  try {
    const { stylistId } = req.params;
    const schedules = await prisma.schedule.findMany({
      where: { stylistId: Number(stylistId) },
      orderBy: { dayOfWeek: 'asc' }
    });

    return res.json(schedules);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar horários de atendimento.' });
  }
}

export async function updateStylistSchedule(req, res) {
  try {
    const { stylistId } = req.params;
    const { schedules } = req.body; // array de { dayOfWeek, startTime, endTime, breakStart, breakEnd, isActive }

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: 'Formato inválido. Envie um array de horários.' });
    }

    const updated = [];
    for (const item of schedules) {
      const schedule = await prisma.schedule.upsert({
        where: {
          stylistId_dayOfWeek: {
            stylistId: Number(stylistId),
            dayOfWeek: Number(item.dayOfWeek)
          }
        },
        update: {
          startTime: item.startTime,
          endTime: item.endTime,
          breakStart: item.breakStart || null,
          breakEnd: item.breakEnd || null,
          isActive: Boolean(item.isActive)
        },
        create: {
          stylistId: Number(stylistId),
          dayOfWeek: Number(item.dayOfWeek),
          startTime: item.startTime,
          endTime: item.endTime,
          breakStart: item.breakStart || null,
          breakEnd: item.breakEnd || null,
          isActive: Boolean(item.isActive)
        }
      });
      updated.push(schedule);
    }

    return res.json({ message: 'Horários atualizados com sucesso.', schedules: updated });
  } catch (error) {
    console.error('Erro ao atualizar horários:', error);
    return res.status(500).json({ error: 'Erro ao atualizar horários de atendimento.' });
  }
}

export async function checkAvailability(req, res) {
  try {
    const { stylistId, serviceId, date } = req.query;

    if (!stylistId || !serviceId || !date) {
      return res.status(400).json({ error: 'stylistId, serviceId e date são parâmetros obrigatórios.' });
    }

    const result = await getAvailableSlots({
      stylistId: Number(stylistId),
      serviceId: Number(serviceId),
      date
    });

    return res.json(result);
  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    return res.status(400).json({ error: error.message || 'Erro ao calcular horários disponíveis.' });
  }
}
