import prisma from '../config/prisma.js';
import { pushNotificationService } from '../services/pushNotificationService.js';
import { broadcastSSE } from './appointmentController.js';
import {
  cleanPhoneDigits,
  normalizeToBrazilianWhatsapp,
  formatPhoneDisplay,
  buildWhatsAppClickToChatUrl
} from '../utils/phoneUtils.js';

/**
 * Utilitário para limpar telefone (apenas números)
 */
function cleanPhoneNumber(phone) {
  return normalizeToBrazilianWhatsapp(phone);
}

/**
 * Gera código único para o bônus (Ex: BONUS-8492)
 */
async function generateUniqueBonusCode() {
  let unique = false;
  let code = '';
  let attempts = 0;

  while (!unique && attempts < 10) {
    attempts++;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    code = `BONUS-${randomNum}`;
    const exists = await prisma.bonusApplication.findUnique({
      where: { code }
    });
    if (!exists) unique = true;
  }

  return code;
}

/**
 * 1. Listar Campanhas Ativas (Público - para exibição no site)
 */
export async function listActiveCampaigns(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const campaigns = await prisma.bonusCampaign.findMany({
      where: {
        active: true
      },
      orderBy: { id: 'desc' }
    });

    // Filtrar se houver data de término no passado
    const validCampaigns = campaigns.filter((c) => {
      if (c.endDate && c.endDate < today) return false;
      if (c.startDate && c.startDate > today) return false;
      return true;
    });

    return res.json(validCampaigns);
  } catch (error) {
    console.error('Erro ao listar campanhas de bônus ativas:', error);
    return res.status(500).json({ error: 'Erro ao carregar promoções e bônus.' });
  }
}

/**
 * 2. Listar Todas as Campanhas (Admin)
 */
export async function listAdminCampaigns(req, res) {
  try {
    const campaigns = await prisma.bonusCampaign.findMany({
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    return res.json(campaigns);
  } catch (error) {
    console.error('Erro ao listar campanhas (admin):', error);
    return res.status(500).json({ error: 'Erro ao carregar campanhas.' });
  }
}

/**
 * 3. Criar Nova Campanha de Bônus (Admin)
 */
export async function createCampaign(req, res) {
  try {
    const {
      title,
      description,
      serviceId,
      discountType = 'PERCENT',
      discountValue = 0,
      giftName,
      active = true,
      startDate,
      endDate,
      badgeText = 'Tempo Limitado',
      imageUrl
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'O título da campanha é obrigatório.' });
    }

    const campaign = await prisma.bonusCampaign.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        serviceId: serviceId ? Number(serviceId) : null,
        discountType: discountType || 'PERCENT',
        discountValue: Number(discountValue) || 0,
        giftName: giftName?.trim() || null,
        active: Boolean(active),
        startDate: startDate || null,
        endDate: endDate || null,
        badgeText: badgeText?.trim() || 'Tempo Limitado',
        imageUrl: imageUrl?.trim() || null
      }
    });

    return res.status(201).json(campaign);
  } catch (error) {
    console.error('Erro ao criar campanha de bônus:', error);
    return res.status(500).json({ error: 'Erro ao criar campanha de bônus.' });
  }
}

/**
 * 4. Atualizar Campanha de Bônus (Admin)
 */
export async function updateCampaign(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      serviceId,
      discountType,
      discountValue,
      giftName,
      active,
      startDate,
      endDate,
      badgeText,
      imageUrl
    } = req.body;

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (description !== undefined) dataToUpdate.description = description?.trim() || null;
    if (serviceId !== undefined) dataToUpdate.serviceId = serviceId ? Number(serviceId) : null;
    if (discountType !== undefined) dataToUpdate.discountType = discountType;
    if (discountValue !== undefined) dataToUpdate.discountValue = Number(discountValue);
    if (giftName !== undefined) dataToUpdate.giftName = giftName?.trim() || null;
    if (active !== undefined) dataToUpdate.active = Boolean(active);
    if (startDate !== undefined) dataToUpdate.startDate = startDate || null;
    if (endDate !== undefined) dataToUpdate.endDate = endDate || null;
    if (badgeText !== undefined) dataToUpdate.badgeText = badgeText?.trim() || 'Tempo Limitado';
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl?.trim() || null;

    const updated = await prisma.bonusCampaign.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });

    return res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar campanha de bônus:', error);
    return res.status(500).json({ error: 'Erro ao salvar alterações da campanha.' });
  }
}

/**
 * 5. Excluir Campanha de Bônus (Admin)
 */
export async function deleteCampaign(req, res) {
  try {
    const { id } = req.params;

    await prisma.bonusCampaign.delete({
      where: { id: Number(id) }
    });

    return res.json({ message: 'Campanha de bônus removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir campanha:', error);
    return res.status(500).json({ error: 'Erro ao excluir campanha.' });
  }
}

/**
 * 6. Cliente Aplica para o Bônus (Público com trava de 15 dias)
 */
export async function applyForBonus(req, res) {
  try {
    const { campaignId, clientName, clientPhone, clientEmail, serviceName } = req.body;

    if (!campaignId || !clientName || !clientPhone) {
      return res.status(400).json({ error: 'Campanha, nome e telefone são obrigatórios.' });
    }

    const campaign = await prisma.bonusCampaign.findUnique({
      where: { id: Number(campaignId) }
    });

    if (!campaign || !campaign.active) {
      return res.status(400).json({ error: 'Esta campanha de bônus não está mais ativa.' });
    }

    const cleanPhone = cleanPhoneNumber(clientPhone);
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Informe um número de WhatsApp válido com DDD.' });
    }

    // REGRA DE OURO: O cliente só pode aplicar para bônus 1 vez a cada 15 dias!
    const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
    const fifteenDaysAgo = new Date(Date.now() - fifteenDaysInMs);

    // Buscar solicitação nos últimos 15 dias que não tenha sido recusada
    const recentApplication = await prisma.bonusApplication.findFirst({
      where: {
        clientPhone: cleanPhone,
        appliedAt: { gte: fifteenDaysAgo },
        status: { in: ['PENDENTE', 'APROVADO', 'UTILIZADO'] }
      },
      orderBy: { appliedAt: 'desc' }
    });

    if (recentApplication) {
      const nextEligibleTime = new Date(recentApplication.appliedAt.getTime() + fifteenDaysInMs);
      const nextEligibleFormatted = nextEligibleTime.toLocaleDateString('pt-BR');

      let statusMsg = 'Você já possui uma solicitação em andamento';
      if (recentApplication.status === 'APROVADO') {
        statusMsg = `Você já possui o bônus liberado (${recentApplication.code})`;
      } else if (recentApplication.status === 'UTILIZADO') {
        statusMsg = 'Você já utilizou um bônus recentemente';
      }

      return res.status(400).json({
        error: `${statusMsg}. Pela política do Studio, cada cliente pode resgatar 1 bônus a cada 15 dias. Você poderá solicitar um novo bônus a partir de ${nextEligibleFormatted}.`,
        recentCode: recentApplication.code,
        recentStatus: recentApplication.status,
        nextEligibleDate: nextEligibleFormatted
      });
    }

    // Gerar código único para a cliente
    const code = await generateUniqueBonusCode();

    const application = await prisma.bonusApplication.create({
      data: {
        campaignId: Number(campaignId),
        clientName: clientName.trim(),
        clientPhone: cleanPhone,
        clientEmail: clientEmail?.trim() || null,
        serviceName: serviceName?.trim() || null,
        status: 'PENDENTE',
        code
      },
      include: {
        campaign: true
      }
    });

    // Notificar administradora em tempo real via Web Push e SSE
    pushNotificationService.sendNotificationToAll({
      title: `🎁 Novo Bônus Solicitado: ${application.clientName}`,
      body: `Campanha: ${application.campaign?.title || 'Bônus'} (${formatPhoneDisplay(cleanPhone)})`,
      url: '/admin',
      tag: `bonus-${application.id}`
    }).catch(err => console.error('Erro ao enviar push de bônus:', err.message));

    broadcastSSE({
      type: 'NEW_BONUS',
      application
    });

    return res.status(201).json({
      message: 'Solicitação de bônus realizada com sucesso!',
      application,
      code,
      details: 'Sua solicitação foi enviada para aprovação da Letícia. Assim que for liberada, você poderá utilizar seu código!'
    });
  } catch (error) {
    console.error('Erro ao aplicar para bônus:', error);
    return res.status(500).json({ error: 'Erro ao processar solicitação de bônus.' });
  }
}

/**
 * 7. Cliente Consulta o Status do Seu Bônus por Telefone (Público)
 */
export async function checkBonusStatus(req, res) {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'Informe seu telefone ou WhatsApp para consultar.' });
    }

    const cleanPhone = cleanPhoneNumber(phone);
    const rawDigits = cleanPhoneDigits(phone);

    const applications = await prisma.bonusApplication.findMany({
      where: {
        OR: [
          { clientPhone: cleanPhone },
          { clientPhone: rawDigits }
        ]
      },
      include: { campaign: true },
      orderBy: { appliedAt: 'desc' }
    });

    return res.json(applications);
  } catch (error) {
    console.error('Erro ao consultar status de bônus:', error);
    return res.status(500).json({ error: 'Erro ao buscar suas solicitações de bônus.' });
  }
}

/**
 * 8. Listar Solicitações de Bônus (Admin)
 */
export async function listApplications(req, res) {
  try {
    const { status, campaignId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (campaignId) where.campaignId = Number(campaignId);

    const applications = await prisma.bonusApplication.findMany({
      where,
      include: {
        campaign: true
      },
      orderBy: { appliedAt: 'desc' }
    });

    return res.json(applications);
  } catch (error) {
    console.error('Erro ao listar solicitações de bônus:', error);
    return res.status(500).json({ error: 'Erro ao carregar solicitações.' });
  }
}

/**
 * 9. Atualizar Status da Solicitação (Aprovar, Recusar, Utilizar) (Admin)
 */
export async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['PENDENTE', 'APROVADO', 'RECUSADO', 'UTILIZADO'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const dataToUpdate = {
      status,
      adminNote: adminNote !== undefined ? adminNote?.trim() : undefined
    };

    if (status === 'APROVADO') {
      dataToUpdate.approvedAt = new Date();
    }

    const updated = await prisma.bonusApplication.update({
      where: { id: Number(id) },
      data: dataToUpdate,
      include: { campaign: true }
    });

    // Gerar link direto para notificar cliente no WhatsApp
    let whatsappNotifyUrl = null;
    if (updated.clientPhone) {
      let msg = '';
      if (status === 'APROVADO') {
        msg = `Olá ${updated.clientName}! 💖\n\nBoas notícias do *Studio Letícia Oliveira*!\nSeu bônus *${updated.campaign.title}* foi *APROVADO* com sucesso!\n\n✨ *Seu Código de Bônus:* ${updated.code}\n\nPara aproveitar, basta informar este código no seu próximo agendamento.\nTe esperamos com muito carinho!`;
      } else if (status === 'RECUSADO') {
        msg = `Olá ${updated.clientName}.\nSua solicitação de bônus para ${updated.campaign.title} não pôde ser aprovada no momento. ${adminNote ? `Motivo: ${adminNote}` : ''}\nFicamos à disposição para quaisquer dúvidas!`;
      }

      if (msg) {
        whatsappNotifyUrl = buildWhatsAppClickToChatUrl(updated.clientPhone, msg);
      }
    }

    return res.json({
      message: `Solicitação atualizada para status: ${status}`,
      application: updated,
      whatsappNotifyUrl
    });
  } catch (error) {
    console.error('Erro ao atualizar status da solicitação:', error);
    return res.status(500).json({ error: 'Erro ao atualizar solicitação de bônus.' });
  }
}
