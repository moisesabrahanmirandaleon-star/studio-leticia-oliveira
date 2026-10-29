import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import webpush from 'web-push';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const subscriptionsFile = path.resolve(__dirname, '../../uploads/push_subscriptions.json');

const DEFAULT_VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BM3owUH5wHWwD29m_usLPAp-XgartNCeNnZYDkVSZUSQXjjbi37Wkd4czijuZKYY8WLJMTznPdj_NG8CXvqNh9M';
const DEFAULT_VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'mFwhRzhJfmQig-i0_3DmUxazLcOHC9wPU2l8DHSkWNM';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:estudioleticiaoliveira@gmail.com';

class PushNotificationService {
  constructor() {
    this.publicKey = DEFAULT_VAPID_PUBLIC_KEY;
    this.privateKey = DEFAULT_VAPID_PRIVATE_KEY;
    this.subject = VAPID_SUBJECT;
    this.subscriptions = [];
    this.init();
  }

  init() {
    try {
      webpush.setVapidDetails(
        this.subject,
        this.publicKey,
        this.privateKey
      );
      this.loadSubscriptions();
      console.log('📡 [PushService] Web Push VAPID inicializado com sucesso.');
    } catch (err) {
      console.warn('⚠️ [PushService] Falha ao configurar VAPID:', err.message);
    }
  }

  loadSubscriptions() {
    try {
      if (fs.existsSync(subscriptionsFile)) {
        const raw = fs.readFileSync(subscriptionsFile, 'utf8');
        this.subscriptions = JSON.parse(raw);
        if (!Array.isArray(this.subscriptions)) this.subscriptions = [];
      } else {
        this.subscriptions = [];
        this.saveSubscriptions();
      }
    } catch {
      this.subscriptions = [];
    }
  }

  saveSubscriptions() {
    try {
      const dir = path.dirname(subscriptionsFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(subscriptionsFile, JSON.stringify(this.subscriptions, null, 2), 'utf8');
    } catch (err) {
      console.error('❌ [PushService] Erro ao salvar inscrições push:', err.message);
    }
  }

  getPublicKey() {
    return this.publicKey;
  }

  addSubscription(sub) {
    if (!sub || !sub.endpoint) return;
    const existingIndex = this.subscriptions.findIndex(s => s.endpoint === sub.endpoint);
    if (existingIndex >= 0) {
      this.subscriptions[existingIndex] = { ...this.subscriptions[existingIndex], ...sub, updatedAt: new Date().toISOString() };
    } else {
      this.subscriptions.push({ ...sub, createdAt: new Date().toISOString() });
    }
    this.saveSubscriptions();
    console.log(`📱 [PushService] Dispositivo registrado com sucesso! Total ativos: ${this.subscriptions.length}`);
  }

  removeSubscription(endpoint) {
    this.subscriptions = this.subscriptions.filter(s => s.endpoint !== endpoint);
    this.saveSubscriptions();
  }

  async sendNotificationToAll({ title, body, icon = '/favicon.svg', url = '/admin', tag = 'studio-alert' }) {
    if (!this.subscriptions || this.subscriptions.length === 0) {
      console.log('ℹ️ [PushService] Nenhum dispositivo admin registrado para Web Push no momento.');
      return { sent: 0, total: 0 };
    }

    const payload = JSON.stringify({
      title,
      body,
      icon,
      url,
      tag,
      timestamp: Date.now()
    });

    let sent = 0;
    const staleEndpoints = [];

    const promises = this.subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (err) {
        // Se a inscrição expirou ou foi cancelada no navegador do cliente (410 Gone / 404 Not Found)
        if (err.statusCode === 404 || err.statusCode === 410) {
          staleEndpoints.push(sub.endpoint);
        } else {
          console.warn(`⚠️ [PushService] Erro ao enviar push para endpoint: ${err.message}`);
        }
      }
    });

    await Promise.allSettled(promises);

    if (staleEndpoints.length > 0) {
      this.subscriptions = this.subscriptions.filter(s => !staleEndpoints.includes(s.endpoint));
      this.saveSubscriptions();
    }

    console.log(`✅ [PushService] Notificação Web Push disparada com sucesso para ${sent}/${this.subscriptions.length} dispositivo(s).`);
    return { sent, total: this.subscriptions.length };
  }
}

export const pushNotificationService = new PushNotificationService();
