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

  // 2. Determinar dia da semana local sem desvio de fuso horário
  const [year, month, day] = date.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay(); // 0 = Domingo ... 6 = Sábado

  // 3. Obter jornada do estilista para o dia
  const schedule = await prisma.schedule.findUnique({
    where: {
      stylistId_dayOfWeek: {
        stylistId: Number(stylistId),
        dayOfWeek
      }
    }
  });

  if (!schedule || !schedule.isActive) {
    return {
      available: false,
      reason: 'A profissional não atende neste dia da semana.',
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

  // Converter intervalos ocupados para minutos
  const occupiedIntervals = existingAppointments.map((app) => ({
    start: timeToMinutes(app.startTime),
    end: timeToMinutes(app.endTime)
  }));

  const workStart = timeToMinutes(schedule.startTime);
  const workEnd = timeToMinutes(schedule.endTime);

  const breakInterval = (schedule.breakStart && schedule.breakEnd)
    ? {
        start: timeToMinutes(schedule.breakStart),
        end: timeToMinutes(schedule.breakEnd)
      }
    : null;

  // 5. Configurar granularidade da grade
  // Se for múltiplo de 15 minutos (ex: 30, 60), avança de 15 em 15.
  // Se for serviço curto como 10 ou 20 minutos (ex: buço, epilação), avança de 10 em 10 para máxima flexibilidade.
  const step = (duration % 15 === 0) ? 15 : 10;

  const slots = [];

  // Se a data for hoje, não exibir horários que já passaram
  const now = new Date();
  const isToday =
    now.getFullYear() === year &&
    now.getMonth() === month - 1 &&
    now.getDate() === day;
  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 15 : -1; // margem de 15 min de antecedência

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

    // Verificar se colide com agendamentos existentes
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
      start: schedule.startTime,
      end: schedule.endTime,
      breakStart: schedule.breakStart,
      breakEnd: schedule.breakEnd
    },
    slots
  };
}

/**
 * Validação rigorosa para criação/reagendamento de consulta (evita colisão e race-conditions)
 */
export async function validateSlotAvailability({ stylistId, date, startTime, durationMinutes, excludeAppointmentId = null }) {
  const [year, month, day] = date.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  const schedule = await prisma.schedule.findUnique({
    where: {
      stylistId_dayOfWeek: {
        stylistId: Number(stylistId),
        dayOfWeek
      }
    }
  });

  if (!schedule || !schedule.isActive) {
    return { valid: false, message: 'Profissional não atende nesta data.' };
  }

  const slotStart = timeToMinutes(startTime);
  const slotEnd = slotStart + Number(durationMinutes);
  const workStart = timeToMinutes(schedule.startTime);
  const workEnd = timeToMinutes(schedule.endTime);

  if (slotStart < workStart || slotEnd > workEnd) {
    return { valid: false, message: 'Horário fora do expediente de atendimento.' };
  }

  if (schedule.breakStart && schedule.breakEnd) {
    const breakStart = timeToMinutes(schedule.breakStart);
    const breakEnd = timeToMinutes(schedule.breakEnd);
    if (hasOverlap(slotStart, slotEnd, breakStart, breakEnd)) {
      return { valid: false, message: 'O horário selecionado coincide com o intervalo da profissional.' };
    }
  }

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
    const appEnd = timeToMinutes(app.endTime);
    if (hasOverlap(slotStart, slotEnd, appStart, appEnd)) {
      return { valid: false, message: 'Este horário já foi reservado por outra cliente.' };
    }
  }

  return {
    valid: true,
    endTime: minutesToTime(slotEnd)
  };
}
