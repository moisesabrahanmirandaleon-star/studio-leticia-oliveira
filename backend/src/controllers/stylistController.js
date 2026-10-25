import prisma from '../config/prisma.js';

export async function listStylists(req, res) {
  try {
    const stylists = await prisma.stylist.findMany({
      where: { active: true },
      include: {
        services: {
          where: { active: true },
          include: { service: true }
        }
      }
    });

    return res.json(stylists);
  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    return res.status(500).json({ error: 'Erro ao listar profissionais.' });
  }
}

export async function getStylistById(req, res) {
  try {
    const { id } = req.params;
    const stylist = await prisma.stylist.findUnique({
      where: { id: Number(id) },
      include: {
        services: {
          where: { active: true },
          include: { service: true }
        },
        schedules: {
          orderBy: { dayOfWeek: 'asc' }
        },
        portfolio: {
          orderBy: { id: 'desc' }
        }
      }
    });

    if (!stylist) {
      return res.status(404).json({ error: 'Profissional não encontrada.' });
    }

    return res.json(stylist);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar profissional.' });
  }
}

export async function updateStylist(req, res) {
  try {
    const { id } = req.params;
    const { name, bio, photoUrl, phone, active } = req.body;

    const updated = await prisma.stylist.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio?.trim() }),
        ...(photoUrl !== undefined && { photoUrl: photoUrl?.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() }),
        ...(active !== undefined && { active: Boolean(active) })
      }
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar dados da profissional.' });
  }
}

export async function listPortfolio(req, res) {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};

    const items = await prisma.portfolioItem.findMany({
      where,
      orderBy: { id: 'desc' }
    });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao carregar portfólio.' });
  }
}

export async function createPortfolioItem(req, res) {
  try {
    const { stylistId, imageUrl, title, category, description } = req.body;

    if (!imageUrl || !title || !category) {
      return res.status(400).json({ error: 'Imagem, título e categoria são obrigatórios.' });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        stylistId: stylistId ? Number(stylistId) : null,
        imageUrl: imageUrl.trim(),
        title: title.trim(),
        category: category.trim(),
        description: description?.trim() || null
      }
    });

    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar item de portfólio.' });
  }
}

export async function deletePortfolioItem(req, res) {
  try {
    const { id } = req.params;
    await prisma.portfolioItem.delete({
      where: { id: Number(id) }
    });

    return res.json({ message: 'Item removido do portfólio com sucesso.' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover item do portfólio.' });
  }
}
