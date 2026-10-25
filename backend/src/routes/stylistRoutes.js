import { Router } from 'express';
import {
  listStylists,
  getStylistById,
  updateStylist,
  listPortfolio,
  createPortfolioItem,
  deletePortfolioItem
} from '../controllers/stylistController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Rotas públicas
router.get('/', listStylists);
router.get('/portfolio', listPortfolio);
router.get('/:id', getStylistById);

// Rotas administrativas protegidas
router.put('/:id', authenticateToken, requireAdmin, updateStylist);
router.post('/portfolio', authenticateToken, requireAdmin, createPortfolioItem);
router.delete('/portfolio/:id', authenticateToken, requireAdmin, deletePortfolioItem);

export default router;
