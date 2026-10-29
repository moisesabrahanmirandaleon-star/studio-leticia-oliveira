import nodemailer from 'nodemailer';
import { formatPhoneDisplay, buildWhatsAppClickToChatUrl } from '../utils/phoneUtils.js';

/**
 * Serviço de notificações por E-mail para a dona do estúdio (Letícia)
 * Suporta SMTP corporativo, Gmail (via App Password), ou simulação com log
 */
export class EmailService {
  constructor() {
    this.adminEmail = process.env.ADMIN_EMAIL || process.env.GOOGLE_CALENDAR_ID || 'estudioleticiaoliveira@gmail.com';
    this.smtpHost = process.env.SMTP_HOST || '';
    this.smtpPort = Number(process.env.SMTP_PORT) || 587;
    this.smtpUser = process.env.SMTP_USER || '';
    this.smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (this.smtpHost && this.smtpUser && this.smtpPass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: this.smtpHost,
          port: this.smtpPort,
          secure: this.smtpPort === 465,
          auth: {
            user: this.smtpUser,
            pass: this.smtpPass
          }
        });
        console.log(`📧 [EmailService] Transporter SMTP configurado para ${this.smtpHost}`);
      } catch (err) {
        console.warn('⚠️ [EmailService] Falha ao inicializar SMTP:', err.message);
      }
    } else if (this.smtpPass && this.adminEmail) {
      try {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: this.adminEmail,
            pass: this.smtpPass
          }
        });
        console.log(`📧 [EmailService] Transporter Gmail configurado para ${this.adminEmail}`);
      } catch (err) {
        console.warn('⚠️ [EmailService] Falha ao inicializar Gmail transporter:', err.message);
      }
    }
  }

  /**
   * Envia notificação por e-mail para a dona do estúdio
   */
  async notifyNewAppointment({ clientName, clientPhone, clientEmail, serviceName, date, startTime, endTime, paymentMethod, notes, price }) {
    const formattedDate = String(date).split('T')[0].split('-').reverse().join('/');
    const subject = `✨ Novo Agendamento: ${clientName} - ${serviceName} (${formattedDate} às ${startTime})`;

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF6F4; border-radius: 20px; overflow: hidden; border: 1px solid #EBDCD5;">
        <div style="background-color: #B87F6C; padding: 24px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">Studio Letícia Oliveira</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">✨ Novo Agendamento Recebido pelo Site</p>
        </div>
        
        <div style="padding: 24px 20px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #292524; margin-top: 0;">Olá <strong>Letícia</strong>,</p>
          <p style="font-size: 14px; color: #57534e; line-height: 1.5;">Uma cliente acabou de reservar um horário através do site:</p>
          
          <div style="background-color: #FAF6F4; border-radius: 14px; padding: 18px; margin: 18px 0; border: 1px solid #DDBFB2;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #44403c;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 120px;">👤 Cliente:</td>
                <td style="padding: 6px 0; color: #1c1917; font-weight: bold;">${clientName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">📱 WhatsApp:</td>
                <td style="padding: 6px 0;">
                  <a href="${buildWhatsAppClickToChatUrl(clientPhone)}" style="color: #059669; font-weight: bold; text-decoration: none;">
                    ${formatPhoneDisplay(clientPhone)} ↗ (Conversar)
                  </a>
                </td>
              </tr>
              ${clientEmail ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">✉️ E-mail:</td>
                <td style="padding: 6px 0;">${clientEmail}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">💆‍♀️ Procedimento:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #B87F6C;">${serviceName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">📅 Data:</td>
                <td style="padding: 6px 0; font-weight: bold;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">⏰ Horário:</td>
                <td style="padding: 6px 0; font-weight: bold;">${startTime} às ${endTime || ''}</td>
              </tr>
              ${price ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">💰 Valor:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #B87F6C;">R$ ${Number(price).toFixed(2).replace('.', ',')}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">💳 Pagamento:</td>
                <td style="padding: 6px 0;">${paymentMethod === 'ONLINE' ? 'Pagamento Online' : 'Presencial no Studio'}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 6px 0; font-weight: bold;">📝 Observações:</td>
                <td style="padding: 6px 0; font-style: italic;">${notes}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="text-align: center; margin: 24px 0 10px 0;">
            <a href="${buildWhatsAppClickToChatUrl(clientPhone)}" 
               style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 9999px; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              Abrir WhatsApp da Cliente 📲
            </a>
          </div>
        </div>

        <div style="background-color: #FAF6F4; padding: 16px 20px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid #EBDCD5;">
          Studio Letícia Oliveira • Notificações Automáticas em Tempo Real
        </div>
      </div>
    `;

    console.log(`📧 [EmailService] Notificação de novo agendamento disparada para ${this.adminEmail}: ${subject}`);

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"Studio Letícia Oliveira" <${this.smtpUser || this.adminEmail}>`,
          to: this.adminEmail,
          subject,
          html: htmlContent
        });
        console.log(`✅ [EmailService] E-mail enviado com sucesso: ${info.messageId}`);
        return { sent: true, messageId: info.messageId };
      } catch (err) {
        console.error('❌ [EmailService] Erro ao enviar e-mail:', err.message);
        return { sent: false, error: err.message };
      }
    } else {
      console.log('ℹ️ [EmailService] Servidor SMTP não configurado (adicione SMTP_HOST/SMTP_USER/SMTP_PASS ou GMAIL_APP_PASSWORD no .env para envio real). Notificação registrada com sucesso.');
      return { sent: false, simulated: true };
    }
  }
}

export const emailService = new EmailService();
