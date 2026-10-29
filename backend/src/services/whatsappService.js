/**
 * Serviço desacoplado e modular de notificações WhatsApp
 * Suporta múltiplos provedores: LOG (desenvolvimento), META_CLOUD, Z_API, TWILIO
 */

import {
  normalizeToBrazilianWhatsapp,
  formatPhoneDisplay,
  buildWhatsAppClickToChatUrl
} from '../utils/phoneUtils.js';

export class WhatsAppService {
  constructor() {
    this.provider = (process.env.WHATSAPP_PROVIDER || 'LOG').toUpperCase();
    this.apiToken = process.env.WHATSAPP_API_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.studioPhone = process.env.STUDIO_PHONE || '5511999999999';
  }

  /**
   * Converte data (YYYY-MM-DD ou ISO) em dia/mês (ex: 25/10) e dia da semana em português (ex: segunda-feira)
   */
  formatDateAndWeekday(dateStr) {
    if (!dateStr) return { dayMonthStr: '', weekdayStr: '', fullDateStr: '' };
    try {
      const dateOnly = String(dateStr).split('T')[0];
      let year, month, day;
      if (dateOnly.includes('-')) {
        const parts = dateOnly.split('-');
        year = Number(parts[0]);
        month = Number(parts[1]);
        day = Number(parts[2]);
      } else if (dateOnly.includes('/')) {
        const parts = dateOnly.split('/');
        day = Number(parts[0]);
        month = Number(parts[1]);
        year = Number(parts[2]) || new Date().getFullYear();
      } else {
        const d = new Date(dateOnly);
        year = d.getFullYear();
        month = d.getMonth() + 1;
        day = d.getDate();
      }

      // Criar a data local sem desvio de fuso horário
      const dateObj = new Date(year, month - 1, day);
      const dayNames = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado'
      ];

      const weekdayStr = dayNames[dateObj.getDay()] || '';
      const dayMonthStr = `${day}/${month}`;
      const fullDateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

      return { dayMonthStr, weekdayStr, fullDateStr };
    } catch {
      return { dayMonthStr: dateStr, weekdayStr: '', fullDateStr: dateStr };
    }
  }

  /**
   * Formata o aviso oficial de confirmação e política de negócio para a cliente
   * Mensagem padrão da Letícia Oliveira com localização detalhada e regras de cancelamento
   */
  formatClientNoticeMessage({ date, startTime, clientName, serviceName, stylist = null }) {
    const { dayMonthStr, weekdayStr } = this.formatDateAndWeekday(date);
    const address = stylist?.address || 'Condomínio Altos da Theodomiro 2, 2435';
    const addressDetails = stylist?.addressDetails || '2ª portaria (meu prédio é o último da rua, são dois condomínios no local)\n🏢 Bloco 6, Apê 652 – 5º andar';
    const policyText = stylist?.customPolicyText || 'Cancelamentos ou remarcações devem ser realizados com 24h de antecedência.\n\nApós esse prazo, será cobrado 50% do valor do procedimento. Em caso de não comparecimento, o pagamento dos 50% também é obrigatório, referente ao horário reservado exclusivamente para você.';
    const pixInfo = stylist?.pixKey ? `\n💳 Chave PIX: ${stylist.pixKey} (${stylist.pixType || 'Chave'})\n` : '';

    return (
      `Combinado! ${dayMonthStr}, ${weekdayStr}, às ${startTime} ✨\n\n` +
      `📍 ${address}\n` +
      `➡️ ${addressDetails}\n\n` +
      `Já aviso que precisa de um pouquinho de fôlego pra subir 🤭 mas vai ser super bem recebida por mim lá em cima! 💖\n` +
      pixInfo +
      `\n⏰ Política de agendamento\n` +
      `${policyText}\n\n` +
      `✨ Essa política existe para que eu consiga organizar minha agenda e respeitar o horário de todas as clientes.\n\n` +
      `Qualquer dúvida, me chama! 💖`
    );
  }

  /**
   * Formata a mensagem de alerta interno para o Studio / Letícia com o padrão solicitado
   */
  formatNewAppointmentMessage({ clientName, serviceName, durationMinutes, date, startTime, clientPhone, paymentMethod }) {
    const { fullDateStr, weekdayStr } = this.formatDateAndWeekday(date);
    const paymentLabel = paymentMethod === 'ONLINE' ? 'Pagamento Online (Cartão/Pix)' : 'Pagar no Local';
    const displayPhone = formatPhoneDisplay(clientPhone);
    const calendarLink = this.generateGoogleCalendarUrl({ clientName, serviceName, durationMinutes, date, startTime, clientPhone });

    return (
      `✨ *Novo Agendamento!*\n\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `💆‍♀️ *Serviço:* ${serviceName} (${durationMinutes} min)\n` +
      `📅 *Data:* ${fullDateStr} (${weekdayStr}) às ${startTime}\n` +
      `📱 *WhatsApp do cliente:* ${displayPhone}\n` +
      `💳 *Pagamento:* ${paymentLabel}\n\n` +
      `📍 *Endereço:* Condomínio Altos da Theodomiro 2, 2435, Bloco 6, Apê 652 (2ª portaria)\n\n` +
      `⏰ *Adicionar à sua Agenda Google (Alerta no Android):*\n${calendarLink}\n\n` +
      `Acesse o painel para gerenciar ou enviar o aviso oficial de confirmação com a política de 24h.`
    );
  }

  /**
   * Gera o link direto para adicionar o evento ao Google Calendar (com alerta nativo no Android)
   */
  generateGoogleCalendarUrl({ clientName, serviceName, durationMinutes, date, startTime, clientPhone }) {
    if (!date || !startTime) return '';
    const cleanDate = date.split('T')[0].replace(/-/g, '');
    const [startH, startM] = startTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = startTotal + Number(durationMinutes || 30);
    const endH = String(Math.floor(endTotal / 60)).padStart(2, '0');
    const endM = String(endTotal % 60).padStart(2, '0');

    const startIso = `${cleanDate}T${String(startH).padStart(2, '0')}${String(startM).padStart(2, '0')}00`;
    const endIso = `${cleanDate}T${endH}${endM}00`;

    const displayPhone = formatPhoneDisplay(clientPhone);
    const title = encodeURIComponent(`✨ Studio Letícia: ${serviceName} - ${clientName}`);
    const details = encodeURIComponent(
      `Cliente: ${clientName}\n` +
      `WhatsApp: ${displayPhone}\n` +
      `Procedimento: ${serviceName} (${durationMinutes} min)\n\n` +
      `📍 Endereço: Condomínio Altos da Theodomiro 2, 2435\n` +
      `➡️ 2ª portaria (meu prédio é o último da rua, são dois condomínios no local)\n` +
      `🏢 Bloco 6, Apê 652 – 5º andar\n\n` +
      `⏰ Política de agendamento: Cancelamento/remarcação com 24h de antecedência. Após esse prazo ou não comparecimento, cobrança de 50%.`
    );
    const location = encodeURIComponent('Condomínio Altos da Theodomiro 2, 2435, Bloco 6, Apê 652');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  }

  /**
   * Gera o link direto de wa.me para abrir no WhatsApp com o texto pronto (garantindo DDI +55 Brasil)
   */
  generateClickToChatUrl(phone, message) {
    return buildWhatsAppClickToChatUrl(phone, message);
  }

  /**
   * Envia ou registra a notificação
   */
  async notifyNewAppointment(appointmentData) {
    const message = this.formatNewAppointmentMessage(appointmentData);
    const targetPhone = appointmentData.stylistPhone || this.studioPhone;
    const waUrl = this.generateClickToChatUrl(targetPhone, message);

    console.log('\n======================================================');
    console.log(`📲 [WhatsApp Service - Provedor: ${this.provider}]`);
    console.log(`Para: ${targetPhone}`);
    console.log('------------------------------------------------------');
    console.log(message);
    console.log('------------------------------------------------------');
    console.log(`🔗 Link de disparo rápido (wa.me): ${waUrl}`);
    console.log('======================================================\n');

    switch (this.provider) {
      case 'META_CLOUD':
        return await this.sendMetaCloud(targetPhone, message);
      case 'Z_API':
        return await this.sendZApi(targetPhone, message);
      case 'TWILIO':
        return await this.sendTwilio(targetPhone, message);
      case 'LOG':
      default:
        return {
          success: true,
          provider: 'LOG',
          simulated: true,
          whatsappUrl: waUrl,
          message
        };
    }
  }

  async sendMetaCloud(phone, message) {
    try {
      const cleanPhone = normalizeToBrazilianWhatsapp(phone);
      const response = await fetch(`https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message }
        })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      console.error('❌ Erro no envio via Meta Cloud API:', error);
      return { success: false, error: error.message };
    }
  }

  async sendZApi(phone, message) {
    try {
      const cleanPhone = normalizeToBrazilianWhatsapp(phone);
      const response = await fetch(`https://api.z-api.io/instances/${this.phoneNumberId}/token/${this.apiToken}/send-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, message })
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error) {
      console.error('❌ Erro no envio via Z-API:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTwilio(phone, message) {
    console.log('Twilio integration ready. Configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
    return { success: true, simulated: true };
  }
}

export const whatsappService = new WhatsAppService();
