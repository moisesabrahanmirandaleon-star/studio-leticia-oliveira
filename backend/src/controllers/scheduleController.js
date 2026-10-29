import prisma from '../config/prisma.js';
import { getAvailableSlots, getMonthScheduleSummary } from '../services/availabilityService.js';

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

/**
 * Retorna o resumo do mês (escala dia a dia) para visualização no admin e no agendamento do cliente
 */
export async function getMonthSchedule(req, res) {
  try {
    const { stylistId, year, month } = req.query;

    if (!stylistId || !year || !month) {
      return res.status(400).json({ error: 'stylistId, year e month são obrigatórios.' });
    }

    const days = await getMonthScheduleSummary({
      stylistId: Number(stylistId),
      year: Number(year),
      month: Number(month)
    });

    const totalDays = days.length;
    const closedDays = days.filter((d) => !d.isOpen);
    const isEntireMonthBlocked = totalDays > 0 && closedDays.length === totalDays;
    const monthBlockReason = isEntireMonthBlocked ? (closedDays[0]?.note || 'Mês Bloqueado / Sem Atendimento') : null;

    return res.json({
      year: Number(year),
      month: Number(month),
      days,
      isEntireMonthBlocked,
      blockedDaysCount: closedDays.length,
      monthBlockReason
    });
  } catch (error) {
    console.error('Erro ao buscar escala do mês:', error);
    return res.status(500).json({ error: 'Erro ao buscar escala do mês.' });
  }
}

/**
 * Atualiza ou define disponibilidade de uma data específica (1 dia)
 */
export async function updateDateSchedule(req, res) {
  try {
    const {
      stylistId,
      date,
      isOpen,
      startTime,
      endTime,
      breakStart,
      breakEnd,
      note
    } = req.body;

    if (!stylistId || !date) {
      return res.status(400).json({ error: 'stylistId e date são obrigatórios.' });
    }

    const updated = await prisma.dateSchedule.upsert({
      where: {
        stylistId_date: {
          stylistId: Number(stylistId),
          date
        }
      },
      update: {
        isOpen: Boolean(isOpen),
        startTime: startTime || null,
        endTime: endTime || null,
        breakStart: breakStart || null,
        breakEnd: breakEnd || null,
        note: note || null
      },
      create: {
        stylistId: Number(stylistId),
        date,
        isOpen: Boolean(isOpen),
        startTime: startTime || null,
        endTime: endTime || null,
        breakStart: breakStart || null,
        breakEnd: breakEnd || null,
        note: note || null
      }
    });

    return res.json({ message: 'Dia atualizado com sucesso.', dateSchedule: updated });
  } catch (error) {
    console.error('Erro ao atualizar dia específico:', error);
    return res.status(500).json({ error: 'Erro ao salvar escala do dia.' });
  }
}

/**
 * Aplicação em Lote / Escala Mensal (Dias Ímpares, Dias Pares, Escala 1x1, 2x2, Escala Dupla, etc.)
 */
export async function batchUpdateSchedule(req, res) {
  try {
    const {
      stylistId,
      year,
      month,
      mode, // 'DUAL_ODD_EVEN' | 'ODD_DAYS' | 'EVEN_DAYS' | 'CUSTOM_DATES' | 'PATTERN_1X1' | 'PATTERN_2X2' | 'WEEKENDS' | 'WEEKDAYS' | 'ALL_DAYS'
      customDates, // array de 'YYYY-MM-DD'
      closeOthers = false, // se true, os outros dias do mês são marcados como fechados
      isOpen = true, // se os dias selecionados estarão abertos ou fechados
      startTime = '09:00',
      endTime = '19:00',
      breakStart = '12:00',
      breakEnd = '13:00',
      note = 'Escala definida',
      oddConfig,
      evenConfig
    } = req.body;

    if (!stylistId || !year || !month || !mode) {
      return res.status(400).json({ error: 'stylistId, year, month e mode são obrigatórios.' });
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const monthStr = String(month).padStart(2, '0');

    // MODO ESPECIAL: ESCALA DUPLA (Ímpares com um horário e Pares com outro horário)
    if (mode === 'DUAL_ODD_EVEN') {
      const odd = oddConfig || {};
      const even = evenConfig || {};
      const operations = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;
        const isOdd = (day % 2 !== 0);
        const cfg = isOdd ? odd : even;

        const dayIsOpen = cfg.isOpen !== undefined ? Boolean(cfg.isOpen) : true;
        const dayStartTime = dayIsOpen ? (cfg.startTime || '09:00') : null;
        const dayEndTime = dayIsOpen ? (cfg.endTime || '19:00') : null;
        const dayBreakStart = dayIsOpen ? (cfg.breakStart || null) : null;
        const dayBreakEnd = dayIsOpen ? (cfg.breakEnd || null) : null;
        const dayNote = cfg.note || (dayIsOpen ? (isOdd ? 'Escala Dias Ímpares' : 'Escala Dias Pares') : 'Folga / Outro Emprego');

        operations.push(
          prisma.dateSchedule.upsert({
            where: {
              stylistId_date: {
                stylistId: Number(stylistId),
                date: dateStr
              }
            },
            update: {
              isOpen: dayIsOpen,
              startTime: dayStartTime,
              endTime: dayEndTime,
              breakStart: dayBreakStart,
              breakEnd: dayBreakEnd,
              note: dayNote
            },
            create: {
              stylistId: Number(stylistId),
              date: dateStr,
              isOpen: dayIsOpen,
              startTime: dayStartTime,
              endTime: dayEndTime,
              breakStart: dayBreakStart,
              breakEnd: dayBreakEnd,
              note: dayNote
            }
          })
        );
      }

      await prisma.$transaction(operations);

      return res.json({
        message: `Escala dupla (Ímpares & Pares) configurada com sucesso para os ${daysInMonth} dias de ${monthStr}/${year}!`,
        appliedDaysCount: daysInMonth
      });
    }

    // Determinar quais dias são selecionados de acordo com o modo
    const targetDates = new Set();

    if (mode === 'CUSTOM_DATES' && Array.isArray(customDates)) {
      customDates.forEach((d) => targetDates.add(d));
    } else {
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay();

        let isSelected = false;

        switch (mode) {
          case 'ODD_DAYS': // Dias ímpares: 1, 3, 5, 7, 9...
            isSelected = (day % 2 !== 0);
            break;
          case 'EVEN_DAYS': // Dias pares: 2, 4, 6, 8, 10...
            isSelected = (day % 2 === 0);
            break;
          case 'PATTERN_1X1': // 1 dia sim, 1 dia não a partir do dia 1
            isSelected = (day % 2 === 1);
            break;
          case 'PATTERN_2X2': // 2 dias trabalha, 2 dias folga
            isSelected = ((Math.floor((day - 1) / 2) % 2) === 0);
            break;
          case 'WEEKENDS': // Sábado e Domingo
            isSelected = (dayOfWeek === 0 || dayOfWeek === 6);
            break;
          case 'WEEKDAYS': // Segunda a Sexta
            isSelected = (dayOfWeek >= 1 && dayOfWeek <= 5);
            break;
          case 'ALL_DAYS': // Todos os dias do mês
            isSelected = true;
            break;
        }

        if (isSelected) {
          targetDates.add(dateStr);
        }
      }
    }

    // Executar operações em transação no Prisma
    const operations = [];
    const targetIsOpen = Boolean(isOpen);

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      const isTarget = targetDates.has(dateStr);

      if (isTarget) {
        operations.push(
          prisma.dateSchedule.upsert({
            where: {
              stylistId_date: {
                stylistId: Number(stylistId),
                date: dateStr
              }
            },
            update: {
              isOpen: targetIsOpen,
              startTime: targetIsOpen ? startTime : null,
              endTime: targetIsOpen ? endTime : null,
              breakStart: targetIsOpen ? (breakStart || null) : null,
              breakEnd: targetIsOpen ? (breakEnd || null) : null,
              note: note || (targetIsOpen ? 'Escala de Trabalho' : 'Folga / Outro trabalho')
            },
            create: {
              stylistId: Number(stylistId),
              date: dateStr,
              isOpen: targetIsOpen,
              startTime: targetIsOpen ? startTime : null,
              endTime: targetIsOpen ? endTime : null,
              breakStart: targetIsOpen ? (breakStart || null) : null,
              breakEnd: targetIsOpen ? (breakEnd || null) : null,
              note: note || (targetIsOpen ? 'Escala de Trabalho' : 'Folga / Outro trabalho')
            }
          })
        );
      } else if (closeOthers) {
        operations.push(
          prisma.dateSchedule.upsert({
            where: {
              stylistId_date: {
                stylistId: Number(stylistId),
                date: dateStr
              }
            },
            update: {
              isOpen: false,
              startTime: null,
              endTime: null,
              breakStart: null,
              breakEnd: null,
              note: 'Folga / Escala obrigatória no outro emprego'
            },
            create: {
              stylistId: Number(stylistId),
              date: dateStr,
              isOpen: false,
              startTime: null,
              endTime: null,
              breakStart: null,
              breakEnd: null,
              note: 'Folga / Escala obrigatória no outro emprego'
            }
          })
        );
      }
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    return res.json({
      message: `Escala mensal atualizada com sucesso para ${targetDates.size} dias.`,
      appliedDaysCount: targetDates.size
    });
  } catch (error) {
    console.error('Erro ao aplicar escala em lote:', error);
    return res.status(500).json({ error: 'Erro ao aplicar escala em lote.' });
  }
}

/**
 * Limpa todas as exceções de um mês (retorna ao horário semanal padrão)
 */
export async function resetMonthSchedule(req, res) {
  try {
    const { stylistId, year, month } = req.query;

    if (!stylistId || !year || !month) {
      return res.status(400).json({ error: 'stylistId, year e month são obrigatórios.' });
    }

    const monthStr = String(month).padStart(2, '0');

    await prisma.dateSchedule.deleteMany({
      where: {
        stylistId: Number(stylistId),
        date: {
          startsWith: `${year}-${monthStr}-`
        }
      }
    });

    return res.json({ message: 'Escala do mês redefinida para o padrão semanal.' });
  } catch (error) {
    console.error('Erro ao redefinir escala do mês:', error);
    return res.status(500).json({ error: 'Erro ao redefinir escala do mês.' });
  }
}

/**
 * Bloquear ou Desbloquear Meses, Semanas, Intervalos ou Dias específicos
 */
export async function blockSchedulePeriod(req, res) {
  try {
    const {
      stylistId,
      type, // 'MONTH' | 'WEEK' | 'RANGE' | 'DAYS'
      year,
      month,
      weekNumber, // 1 a 5
      startDate,
      endDate,
      dates, // array de 'YYYY-MM-DD'
      isOpen = false, // false = bloquear, true = liberar
      reason = 'Bloqueado pela Administradora'
    } = req.body;

    if (!stylistId || !type) {
      return res.status(400).json({ error: 'stylistId e type são obrigatórios.' });
    }

    const targetDates = [];

    if (type === 'MONTH') {
      if (!year || !month) return res.status(400).json({ error: 'year e month são obrigatórios para bloquear o mês.' });
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthStr = String(month).padStart(2, '0');
      for (let day = 1; day <= daysInMonth; day++) {
        targetDates.push(`${year}-${monthStr}-${String(day).padStart(2, '0')}`);
      }
    } else if (type === 'WEEK') {
      if (startDate && endDate) {
        let current = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        while (current <= end) {
          targetDates.push(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
      } else if (year && month && weekNumber) {
        const daysInMonth = new Date(year, month, 0).getDate();
        const monthStr = String(month).padStart(2, '0');
        const startDay = (Number(weekNumber) - 1) * 7 + 1;
        const endDay = Math.min(startDay + 6, daysInMonth);
        for (let d = startDay; d <= endDay; d++) {
          targetDates.push(`${year}-${monthStr}-${String(d).padStart(2, '0')}`);
        }
      } else {
        return res.status(400).json({ error: 'Informe startDate e endDate ou year, month e weekNumber.' });
      }
    } else if (type === 'RANGE') {
      if (!startDate || !endDate) return res.status(400).json({ error: 'startDate e endDate são obrigatórios.' });
      let current = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      while (current <= end) {
        targetDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    } else if (type === 'DAYS') {
      if (!Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({ error: 'Informe uma lista de datas para bloquear.' });
      }
      targetDates.push(...dates);
    }

    if (targetDates.length === 0) {
      return res.status(400).json({ error: 'Nenhuma data encontrada para aplicar a regra.' });
    }

    const defaultReason = Boolean(isOpen) ? 'Atendimento confirmado' : 'Sem atendimento / Bloqueado';
    const finalReason = reason && reason.trim() ? reason.trim() : defaultReason;

    const operations = targetDates.map((dateStr) => {
      return prisma.dateSchedule.upsert({
        where: {
          stylistId_date: {
            stylistId: Number(stylistId),
            date: dateStr
          }
        },
        update: {
          isOpen: Boolean(isOpen),
          note: finalReason
        },
        create: {
          stylistId: Number(stylistId),
          date: dateStr,
          isOpen: Boolean(isOpen),
          note: finalReason
        }
      });
    });

    await prisma.$transaction(operations);

    const actionText = Boolean(isOpen) ? 'liberados' : 'bloqueados';
    return res.json({
      message: `${targetDates.length} dia(s) foram ${actionText} com sucesso.`,
      appliedDaysCount: targetDates.length,
      targetDates
    });
  } catch (error) {
    console.error('Erro ao bloquear período na agenda:', error);
    return res.status(500).json({ error: 'Erro ao bloquear período na agenda.' });
  }
}
