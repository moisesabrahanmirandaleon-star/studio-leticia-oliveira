import { Router } from 'express';
import {
  listActiveCampaigns,
  listAdminCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  applyForBonus,
  checkBonusStatus,
  listApplications,
  updateApplicationStatus
} from '../controllers/bonusController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Rotas públicas (Clientes)
router.get('/', listActiveCampaigns);
router.post('/apply', applyForBonus);
router.get('/status', checkBonusStatus);

// Rotas administrativas protegidas (Dona)
router.get('/admin/campaigns', authenticateToken, requireAdmin, listAdminCampaigns);
router.post('/campaign', authenticateToken, requireAdmin, createCampaign);
router.put('/campaign/:id', authenticateToken, requireAdmin, updateCampaign);
router.delete('/campaign/:id', authenticateToken, requireAdmin, deleteCampaign);

router.get('/admin/applications', authenticateToken, requireAdmin, listApplications);
router.patch('/admin/applications/:id', authenticateToken, requireAdmin, updateApplicationStatus);

export default router;
