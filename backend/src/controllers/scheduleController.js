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

    return res.json({ year: Number(year), month: Number(month), days });
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
 * Aplicação em Lote / Escala Mensal (Dias Ímpares, Dias Pares, Escala 1x1, 2x2, etc.)
 */
export async function batchUpdateSchedule(req, res) {
  try {
    const {
      stylistId,
      year,
      month,
      mode, // 'ODD_DAYS' | 'EVEN_DAYS' | 'CUSTOM_DATES' | 'PATTERN_1X1' | 'PATTERN_2X2' | 'WEEKENDS' | 'WEEKDAYS'
      customDates, // array de 'YYYY-MM-DD'
      closeOthers = false, // se true, os outros dias do mês são marcados como fechados
      startTime = '09:00',
      endTime = '19:00',
      breakStart = '12:00',
      breakEnd = '13:00',
      note = 'Escala definida'
    } = req.body;

    if (!stylistId || !year || !month || !mode) {
      return res.status(400).json({ error: 'stylistId, year, month e mode são obrigatórios.' });
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const monthStr = String(month).padStart(2, '0');

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
              isOpen: true,
              startTime,
              endTime,
              breakStart: breakStart || null,
              breakEnd: breakEnd || null,
              note: note || 'Escala de Trabalho'
            },
            create: {
              stylistId: Number(stylistId),
              date: dateStr,
              isOpen: true,
              startTime,
              endTime,
              breakStart: breakStart || null,
              breakEnd: breakEnd || null,
              note: note || 'Escala de Trabalho'
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
              note: 'Folga / Escala obrigatória no outro emprego'
            },
            create: {
              stylistId: Number(stylistId),
              date: dateStr,
              isOpen: false,
              note: 'Folga / Escala obrigatória no outro emprego'
            }
          })
        );
      }
    }

    await prisma.$transaction(operations);

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
