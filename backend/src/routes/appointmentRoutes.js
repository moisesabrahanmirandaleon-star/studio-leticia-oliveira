import { Router } from 'express';
import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Rota pública para cliente agendar
router.post('/', createAppointment);

// Rotas administrativas protegidas para gestão da agenda
router.get('/', authenticateToken, listAppointments);
router.patch('/:id/status', authenticateToken, updateAppointmentStatus);
router.patch('/:id/reschedule', authenticateToken, rescheduleAppointment);
router.delete('/:id', authenticateToken, deleteAppointment);

export default router;
