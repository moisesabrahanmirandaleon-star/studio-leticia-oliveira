import express from 'express';
import { pushNotificationService } from '../services/pushNotificationService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Obter chave pública VAPID para o frontend
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: pushNotificationService.getPublicKey() });
});

// Registrar inscrição Web Push do celular/computador da administradora
router.post('/subscribe', (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Inscrição push inválida.' });
    }

    pushNotificationService.addSubscription(subscription);
    res.json({ success: true, message: 'Dispositivo registrado com sucesso para notificações push!' });
  } catch (error) {
    console.error('Erro ao registrar push:', error);
    res.status(500).json({ error: 'Falha ao salvar inscrição push.' });
  }
});

// Testar disparo forçado de notificação Push
router.post('/test', async (req, res) => {
  try {
    const result = await pushNotificationService.sendNotificationToAll({
      title: '✨ Studio Letícia: Teste Conectado!',
      body: 'Seu celular Android e este navegador estão 100% configurados para receber alertas instantâneos!',
      url: '/admin'
    });

    res.json({
      success: true,
      message: 'Disparo de teste executado.',
      ...result
    });
  } catch (error) {
    console.error('Erro ao testar push:', error);
    res.status(500).json({ error: 'Erro ao disparar teste de notificação push.' });
  }
});

export default router;
