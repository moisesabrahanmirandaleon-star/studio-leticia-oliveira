import { Router } from 'express';
import {
  getStylistSchedule,
  updateStylistSchedule,
  checkAvailability,
  getMonthSchedule,
  updateDateSchedule,
  batchUpdateSchedule,
  resetMonthSchedule,
  blockSchedulePeriod
} from '../controllers/scheduleController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Rota pública para checagem de slots disponíveis no fluxo de agendamento
router.get('/availability', checkAvailability);

// Rota pública para obter visualização de disponibilidade do mês
router.get('/month', getMonthSchedule);

// Rotas de configuração de expediente semanal
router.get('/stylist/:stylistId', getStylistSchedule);
router.put('/stylist/:stylistId', authenticateToken, requireAdmin, updateStylistSchedule);

// Rotas de escala por data e em lote (Autonomia para Letícia)
router.put('/date', authenticateToken, requireAdmin, updateDateSchedule);
router.post('/batch', authenticateToken, requireAdmin, batchUpdateSchedule);
router.post('/block', authenticateToken, requireAdmin, blockSchedulePeriod);
router.delete('/month', authenticateToken, requireAdmin, resetMonthSchedule);

export default router;
