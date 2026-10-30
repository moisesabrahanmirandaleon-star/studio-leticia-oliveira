import fs from 'fs';
import path from 'path';
import { JWT } from 'google-auth-library';
import { formatPhoneDisplay } from '../utils/phoneUtils.js';

/**
 * Serviço de sincronização 100% automático com Google Calendar
 * Permite que a dona do estúdio (Letícia) receba as reservas direto na agenda do celular
 * sem precisar clicar em nada nem ficar com o site aberto.
 * 
 * Suporta:
 * 1. Google Calendar API direta via Service Account (central-de-conexiones)
 * 2. Webhook via Google Apps Script (se configurado)
 */
export class CalendarSyncService {
  constructor() {
    this.webhookUrl = process.env.CALENDAR_WEBHOOK_URL || '';
    this.calendarId = process.env.GOOGLE_CALENDAR_ID || 'moisesabrahanmirandaleon@gmail.com';
    
    const possiblePaths = [
      path.resolve(process.cwd(), 'service-account.json'),
      path.resolve(process.cwd(), 'backend', 'service-account.json'),
      path.resolve(process.cwd(), '..', 'backend', 'service-account.json'),
      path.resolve('service-account.json'),
      path.resolve('backend/service-account.json')
    ];
    this.keyFilePath = possiblePaths.find(p => fs.existsSync(p)) || '';
    this.jwtClient = null;
    this.initServiceAccount();
  }

  initServiceAccount() {
    try {
      let keys = null;
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
          keys = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        } catch {
          const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8');
          keys = JSON.parse(decoded);
        }
      } else if (this.keyFilePath && fs.existsSync(this.keyFilePath)) {
        keys = JSON.parse(fs.readFileSync(this.keyFilePath, 'utf8'));
      }

      if (keys) {
        this.jwtClient = new JWT({
          email: keys.client_email,
          key: keys.private_key,
          scopes: ['https://www.googleapis.com/auth/calendar']
        });
        console.log(`📅 [CalendarSync] Service Account inicializada com sucesso: ${keys.client_email}`);
      } else {
        console.warn('⚠️ [CalendarSync] Nenhuma credencial de Service Account encontrada (arquivo ou GOOGLE_SERVICE_ACCOUNT_KEY).');
      }
    } catch (e) {
      console.warn('⚠️ [CalendarSync] Aviso ao inicializar Service Account:', e.message);
    }
  }

  /**
   * Cria o evento no Google Calendar da dona em tempo real
   */
  async syncAppointment(appointmentData) {
    let synced = false;

    // 1. Tentativa via Google Calendar API Direta (Service Account)
    if (this.jwtClient && this.calendarId) {
      try {
        const cleanDate = String(appointmentData.date).split('T')[0];
        const startIso = `${cleanDate}T${appointmentData.startTime}:00`;
        let endDate = cleanDate;
        if (appointmentData.endTime <= appointmentData.startTime) {
          const d = new Date(cleanDate + 'T12:00:00');
          d.setDate(d.getDate() + 1);
          endDate = d.toISOString().split('T')[0];
        }
        const endIso = `${endDate}T${appointmentData.endTime}:00`;

        const eventPayload = {
          summary: `✨ Studio: ${appointmentData.serviceName} - ${appointmentData.clientName}`,
          location: 'Condomínio Altos da Theodomiro 2, 2435, Bloco 6, Apê 652',
          description: (
            `👤 Cliente: ${appointmentData.clientName}\n` +
            `📱 WhatsApp: ${formatPhoneDisplay(appointmentData.clientPhone)}\n` +
            `💆‍♀️ Procedimento: ${appointmentData.serviceName} (${appointmentData.durationMinutes || 60} min)\n` +
            `📍 Endereço: Condomínio Altos da Theodomiro 2, 2435, Bloco 6, Apê 652 (2ª portaria)\n\n` +
            `⏰ Regra: Cancelamento/remarcação com 24h de antecedência.`
          ),
          start: {
            dateTime: startIso,
            timeZone: 'America/Sao_Paulo'
          },
          end: {
            dateTime: endIso,
            timeZone: 'America/Sao_Paulo'
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 60 },
              { method: 'popup', minutes: 15 }
            ]
          }
        };

        const res = await this.jwtClient.request({
          url: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId)}/events`,
          method: 'POST',
          data: eventPayload
        });

        console.log(`✅ [CalendarSync] Evento inserido automaticamente no Google Calendar (${this.calendarId})! EventId: ${res.data.id}`);
        synced = true;
        return { synced: true, provider: 'GOOGLE_API', eventId: res.data.id };
      } catch (err) {
        console.warn('ℹ️ [CalendarSync] Google API direta retornou:', err.response?.data?.error?.message || err.message);
      }
    }

    // 2. Tentativa via Webhook (Google Apps Script) se configurado
    if (this.webhookUrl) {
      try {
        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'NEW_APPOINTMENT',
            title: `✨ Studio: ${appointmentData.serviceName} - ${appointmentData.clientName}`,
            clientName: appointmentData.clientName,
            clientPhone: appointmentData.clientPhone,
            serviceName: appointmentData.serviceName,
            durationMinutes: appointmentData.durationMinutes,
            date: appointmentData.date,
            startTime: appointmentData.startTime,
            endTime: appointmentData.endTime,
            location: 'Condomínio Altos da Theodomiro 2, 2435, Bloco 6, Apê 652',
            details: `Cliente: ${appointmentData.clientName}\nWhatsApp: ${appointmentData.clientPhone}\nProcedimento: ${appointmentData.serviceName}\nEndereço: Condomínio Altos da Theodomiro 2, 2435, Bloco 6, Apê 652 (2ª portaria)`
          })
        });
        synced = response.ok;
        return { synced: response.ok, provider: 'WEBHOOK' };
      } catch (error) {
        console.error('❌ [CalendarSync] Erro via webhook:', error.message);
      }
    }

    return { synced, reason: 'Calendário ainda aguarda compartilhamento com o Service Account ou Webhook' };
  }
}

export const calendarSyncService = new CalendarSyncService();
