import { Router } from 'express';
import {
  getStylistSchedule,
  updateStylistSchedule,
  checkAvailability
} from '../controllers/scheduleController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Rota pública para checagem de slots disponíveis no fluxo de agendamento
router.get('/availability', checkAvailability);

// Rotas de configuração de expediente
router.get('/stylist/:stylistId', getStylistSchedule);
router.put('/stylist/:stylistId', authenticateToken, requireAdmin, updateStylistSchedule);

export default router;
