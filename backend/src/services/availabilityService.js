import prisma from '../config/prisma.js';

// Utilitários de conversão de tempo
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function hasOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

/**
 * Obtém as regras de atendimento efetivas para um profissional em uma data.
 * Prioridade: DateSchedule específico > Schedule semanal padrão.
 */
export async function getEffectiveDaySchedule(stylistId, date) {
  const [year, month, day] = date.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay(); // 0 = Domingo ... 6 = Sábado

  // 1. Verificar se existe escala / exceção de data específica
  const dateSchedule = await prisma.dateSchedule.findUnique({
    where: {
      stylistId_date: {
        stylistId: Number(stylistId),
        date
      }
    }
  });

  // 2. Obter jornada padrão semanal
  const defaultSchedule = await prisma.schedule.findUnique({
    where: {
      stylistId_dayOfWeek: {
        stylistId: Number(stylistId),
        dayOfWeek
      }
    }
  });

  // Se houver exceção para a data específica
  if (dateSchedule) {
    if (!dateSchedule.isOpen) {
      return {
        isOpen: false,
        reason: dateSchedule.note || 'Profissional indisponível nesta data (escala obrigatória / folga).',
        isOverride: true
      };
    }

    return {
      isOpen: true,
      startTime: dateSchedule.startTime || defaultSchedule?.startTime || '09:00',
      endTime: dateSchedule.endTime || defaultSchedule?.endTime || '19:00',
      breakStart: dateSchedule.breakStart !== undefined ? dateSchedule.breakStart : defaultSchedule?.breakStart,
      breakEnd: dateSchedule.breakEnd !== undefined ? dateSchedule.breakEnd : defaultSchedule?.breakEnd,
      isOverride: true,
      note: dateSchedule.note
    };
  }

  // Se não houver exceção de data, usa o padrão semanal
  if (!defaultSchedule || !defaultSchedule.isActive) {
    return {
      isOpen: false,
      reason: 'A profissional não atende neste dia da semana.',
      isOverride: false
    };
  }

  return {
    isOpen: true,
    startTime: defaultSchedule.startTime,
    endTime: defaultSchedule.endTime,
    breakStart: defaultSchedule.breakStart,
    breakEnd: defaultSchedule.breakEnd,
    isOverride: false
  };
}

/**
 * Calcula horários disponíveis para um estilista, serviço e data específica.
 */
export async function getAvailableSlots({ stylistId, serviceId, date }) {
  // 1. Obter serviço
  const service = await prisma.service.findUnique({
    where: { id: Number(serviceId) }
  });

  if (!service || !service.active) {
    throw new Error('Serviço não encontrado ou inativo.');
  }

  const duration = service.durationMinutes;

  // 2. Obter estilista (para checar tempo de intervalo/buffer entre atendimentos)
  const stylist = await prisma.stylist.findUnique({
    where: { id: Number(stylistId) },
    select: { id: true, name: true, bufferMinutes: true }
  });

  const bufferMinutes = stylist?.bufferMinutes || 0;

  // 3. Obter jornada efetiva do dia
  const effectiveSchedule = await getEffectiveDaySchedule(stylistId, date);

  if (!effectiveSchedule.isOpen) {
    return {
      available: false,
      reason: effectiveSchedule.reason || 'Data indisponível para agendamento.',
      slots: []
    };
  }

  // 4. Obter agendamentos já existentes na mesma data
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      stylistId: Number(stylistId),
      date,
      status: { notIn: ['CANCELADO'] }
    },
    select: {
      startTime: true,
      endTime: true
    }
  });

  // Converter intervalos ocupados para minutos, incluindo buffer
  const occupiedIntervals = existingAppointments.map((app) => ({
    start: timeToMinutes(app.startTime),
    // Adiciona o buffer de descanso/higienização após o agendamento
    end: timeToMinutes(app.endTime) + bufferMinutes
  }));

  const workStart = timeToMinutes(effectiveSchedule.startTime);
  const workEnd = timeToMinutes(effectiveSchedule.endTime);

  const breakInterval = (effectiveSchedule.breakStart && effectiveSchedule.breakEnd)
    ? {
        start: timeToMinutes(effectiveSchedule.breakStart),
        end: timeToMinutes(effectiveSchedule.breakEnd)
      }
    : null;

  // 5. Configurar granularidade da grade (15 min padrão, ou 10 min para serviços rápidos)
  const step = (duration % 15 === 0) ? 15 : 10;

  const slots = [];

  // Se a data for hoje, não exibir horários que já passaram
  const [year, month, day] = date.split('-').map(Number);
  const now = new Date();
  const isToday =
    now.getFullYear() === year &&
    now.getMonth() === month - 1 &&
    now.getDate() === day;
  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 15 : -1;

  // 6. Percorrer a linha do tempo e verificar viabilidade de cada bloco
  for (let slotStart = workStart; slotStart + duration <= workEnd; slotStart += step) {
    const slotEnd = slotStart + duration;

    // Se for hoje e já passou do horário atual, pula
    if (isToday && slotStart < currentMinutes) {
      continue;
    }

    // Verificar se invade o intervalo de almoço/descanso
    if (breakInterval && hasOverlap(slotStart, slotEnd, breakInterval.start, breakInterval.end)) {
      continue;
    }

    // Verificar se colide com agendamentos existentes (considerando o buffer)
    const collidesWithAppointment = occupiedIntervals.some((app) =>
      hasOverlap(slotStart, slotEnd, app.start, app.end)
    );

    if (collidesWithAppointment) {
      continue;
    }

    slots.push({
      startTime: minutesToTime(slotStart),
      endTime: minutesToTime(slotEnd),
      durationMinutes: duration
    });
  }

  return {
    available: slots.length > 0,
    service: {
      id: service.id,
      name: service.name,
      durationMinutes: service.durationMinutes,
      price: service.price
    },
    workHours: {
      start: effectiveSchedule.startTime,
      end: effectiveSchedule.endTime,
      breakStart: effectiveSchedule.breakStart,
      breakEnd: effectiveSchedule.breakEnd,
      isOverride: effectiveSchedule.isOverride,
      note: effectiveSchedule.note
    },
    slots
  };
}

/**
 * Validação rigorosa para criação/reagendamento de consulta
 */
export async function validateSlotAvailability({ stylistId, date, startTime, durationMinutes, excludeAppointmentId = null }) {
  const effectiveSchedule = await getEffectiveDaySchedule(stylistId, date);

  if (!effectiveSchedule.isOpen) {
    return { valid: false, message: effectiveSchedule.reason || 'Profissional não atende nesta data.' };
  }

  const slotStart = timeToMinutes(startTime);
  const slotEnd = slotStart + Number(durationMinutes);
  const workStart = timeToMinutes(effectiveSchedule.startTime);
  const workEnd = timeToMinutes(effectiveSchedule.endTime);

  if (slotStart < workStart || slotEnd > workEnd) {
    return { valid: false, message: 'Horário fora do expediente de atendimento da profissional.' };
  }

  if (effectiveSchedule.breakStart && effectiveSchedule.breakEnd) {
    const breakStart = timeToMinutes(effectiveSchedule.breakStart);
    const breakEnd = timeToMinutes(effectiveSchedule.breakEnd);
    if (hasOverlap(slotStart, slotEnd, breakStart, breakEnd)) {
      return { valid: false, message: 'O horário selecionado coincide com o intervalo de descanso da profissional.' };
    }
  }

  const stylist = await prisma.stylist.findUnique({
    where: { id: Number(stylistId) },
    select: { bufferMinutes: true }
  });
  const bufferMinutes = stylist?.bufferMinutes || 0;

  const whereClause = {
    stylistId: Number(stylistId),
    date,
    status: { notIn: ['CANCELADO'] }
  };

  if (excludeAppointmentId) {
    whereClause.id = { not: Number(excludeAppointmentId) };
  }

  const existing = await prisma.appointment.findMany({
    where: whereClause,
    select: { startTime: true, endTime: true }
  });

  for (const app of existing) {
    const appStart = timeToMinutes(app.startTime);
    const appEnd = timeToMinutes(app.endTime) + bufferMinutes;
    if (hasOverlap(slotStart, slotEnd, appStart, appEnd)) {
      return { valid: false, message: 'Este horário já foi reservado ou colide com outro atendimento.' };
    }
  }

  return {
    valid: true,
    endTime: minutesToTime(slotEnd)
  };
}

/**
 * Retorna o resumo de disponibilidade de todos os dias de um mês específico
 */
export async function getMonthScheduleSummary({ stylistId, year, month }) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthStr = String(month).padStart(2, '0');

  // Buscar todos os DateSchedule cadastrados para este mês
  const dateSchedules = await prisma.dateSchedule.findMany({
    where: {
      stylistId: Number(stylistId),
      date: {
        startsWith: `${year}-${monthStr}-`
      }
    }
  });

  const dateMap = new Map();
  dateSchedules.forEach((ds) => {
    dateMap.set(ds.date, ds);
  });

  // Buscar agendamentos do mês para contar quantas clientes tem em cada dia
  const appointments = await prisma.appointment.findMany({
    where: {
      stylistId: Number(stylistId),
      date: {
        startsWith: `${year}-${monthStr}-`
      },
      status: { notIn: ['CANCELADO'] }
    },
    select: { date: true }
  });

  const appointmentCountMap = new Map();
  appointments.forEach((app) => {
    appointmentCountMap.set(app.date, (appointmentCountMap.get(app.date) || 0) + 1);
  });

  // Buscar horários semanais padrão
  const weeklySchedules = await prisma.schedule.findMany({
    where: { stylistId: Number(stylistId) }
  });
  const weeklyMap = new Map();
  weeklySchedules.forEach((ws) => {
    weeklyMap.set(ws.dayOfWeek, ws);
  });

  const days = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const date = `${year}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    const override = dateMap.get(date);
    const weekly = weeklyMap.get(dayOfWeek);

    let isOpen = false;
    let isOverride = false;
    let startTime = null;
    let endTime = null;
    let breakStart = null;
    let breakEnd = null;
    let note = null;

    if (override) {
      isOverride = true;
      isOpen = override.isOpen;
      startTime = override.startTime || weekly?.startTime || '09:00';
      endTime = override.endTime || weekly?.endTime || '19:00';
      breakStart = override.breakStart || weekly?.breakStart || null;
      breakEnd = override.breakEnd || weekly?.breakEnd || null;
      note = override.note;
    } else if (weekly && weekly.isActive) {
      isOpen = true;
      startTime = weekly.startTime;
      endTime = weekly.endTime;
      breakStart = weekly.breakStart;
      breakEnd = weekly.breakEnd;
    }

    days.push({
      date,
      day,
      dayOfWeek,
      isOpen,
      isOverride,
      startTime,
      endTime,
      breakStart,
      breakEnd,
      note,
      appointmentCount: appointmentCountMap.get(date) || 0
    });
  }

  return days;
}
