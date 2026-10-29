/**
 * Utilitários centralizados para tratamento de números de telefone e WhatsApp (Brasil +55)
 */

/**
 * Remove todos os caracteres não numéricos
 */
export function cleanPhoneDigits(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '');
}

/**
 * Normaliza qualquer formato de telefone brasileiro para o formato E.164 numérico sem '+' (ex: 5551980470713)
 * Usado diretamente para disparos do WhatsApp (wa.me, Meta Cloud API, Z-API)
 */
export function normalizeToBrazilianWhatsapp(phone) {
  if (!phone) return '';
  let digits = cleanPhoneDigits(phone);

  if (!digits) return '';

  // Se o usuário digitou o 0 de operadora (ex: 051980470713 -> 51980470713)
  if (digits.startsWith('0') && (digits.length === 11 || digits.length === 12)) {
    digits = digits.slice(1);
  }

  // Caso 1: Celular padrão com DDD (11 dígitos, ex: 51980470713)
  // DDD 51 (Porto Alegre / São Leopoldo) ou qualquer outro estado brasileiro
  if (digits.length === 11) {
    return `55${digits}`;
  }

  // Caso 2: Fixo padrão com DDD (10 dígitos, ex: 5133445566)
  if (digits.length === 10) {
    return `55${digits}`;
  }

  // Caso 3: Já possui o código do país 55 (12 ou 13 dígitos)
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    return digits;
  }

  // Caso 4: Usuário digitou apenas o número sem o DDD (9 dígitos celular ou 8 fixo)
  // Assumir o DDD 51 por padrão (Região do Studio Letícia Oliveira)
  if (digits.length === 9) {
    return `5551${digits}`;
  }
  if (digits.length === 8) {
    return `5551${digits}`;
  }

  // Se for um número internacional ou outro tamanho
  return digits;
}

/**
 * Formata o telefone para exibição visual elegante com DDI oficial do Brasil (+55)
 * Exemplo: "+55 (51) 98047-0713"
 */
export function formatPhoneDisplay(phone) {
  if (!phone) return '';
  const wa = normalizeToBrazilianWhatsapp(phone);

  // Celular: 55 + 2 DDD + 9 dígitos = 13 dígitos
  if (wa.length === 13 && wa.startsWith('55')) {
    const ddd = wa.slice(2, 4);
    const part1 = wa.slice(4, 9);
    const part2 = wa.slice(9);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }

  // Fixo: 55 + 2 DDD + 8 dígitos = 12 dígitos
  if (wa.length === 12 && wa.startsWith('55')) {
    const ddd = wa.slice(2, 4);
    const part1 = wa.slice(4, 8);
    const part2 = wa.slice(8);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }

  return String(phone).trim();
}

/**
 * Gera URL pronta e segura para wa.me com DDI +55 garantido
 */
export function buildWhatsAppClickToChatUrl(phone, message = '') {
  const waNumber = normalizeToBrazilianWhatsapp(phone);
  if (!waNumber) return '';
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${waNumber}${query}`;
}
