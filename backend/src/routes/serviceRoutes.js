import { Router } from 'express';
import {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Rotas públicas
router.get('/', listServices);
router.get('/:id', getServiceById);

// Rotas administrativas protegidas
router.post('/', authenticateToken, requireAdmin, createService);
router.put('/:id', authenticateToken, requireAdmin, updateService);
router.delete('/:id', authenticateToken, requireAdmin, deleteService);

export default router;
