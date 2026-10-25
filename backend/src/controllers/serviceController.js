import prisma from '../config/prisma.js';

export async function listServices(req, res) {
  try {
    const { includeInactive } = req.query;
    const where = includeInactive === 'true' ? {} : { active: true };

    const services = await prisma.service.findMany({
      where,
      orderBy: { id: 'asc' }
    });

    return res.json(services);
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    return res.status(500).json({ error: 'Erro ao listar serviços.' });
  }
}

export async function getServiceById(req, res) {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id: Number(id) }
    });

    if (!service) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }

    return res.json(service);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar serviço.' });
  }
}

export async function createService(req, res) {
  try {
    const { name, description, price, durationMinutes, category } = req.body;

    if (!name || price === undefined || !durationMinutes) {
      return res.status(400).json({ error: 'Nome, preço e duração são obrigatórios.' });
    }

    const newService = await prisma.service.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        durationMinutes: parseInt(durationMinutes, 10),
        category: category?.trim() || 'Geral',
        active: true
      }
    });

    // Associar automaticamente aos estilistas ativos
    const stylists = await prisma.stylist.findMany({ where: { active: true } });
    for (const stylist of stylists) {
      await prisma.stylistService.create({
        data: {
          stylistId: stylist.id,
          serviceId: newService.id,
          active: true
        }
      });
    }

    return res.status(201).json(newService);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return res.status(500).json({ error: 'Erro ao criar serviço.' });
  }
}

export async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, durationMinutes, category, active } = req.body;

    const updatedService = await prisma.service.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(durationMinutes !== undefined && { durationMinutes: parseInt(durationMinutes, 10) }),
        ...(category !== undefined && { category: category?.trim() }),
        ...(active !== undefined && { active: Boolean(active) })
      }
    });

    return res.json(updatedService);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return res.status(500).json({ error: 'Erro ao atualizar serviço.' });
  }
}

export async function deleteService(req, res) {
  try {
    const { id } = req.params;

    // Em vez de hard-delete que violaria integridade de histórico de agendamentos, desativa o serviço
    const deactivated = await prisma.service.update({
      where: { id: Number(id) },
      data: { active: false }
    });

    return res.json({ message: 'Serviço desativado com sucesso.', service: deactivated });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao desativar serviço.' });
  }
}
