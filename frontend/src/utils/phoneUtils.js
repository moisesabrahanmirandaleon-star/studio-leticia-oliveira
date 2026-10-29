/**
 * Utilitários centralizados para telefone e WhatsApp no Frontend (Padrão Brasil +55)
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
 * Usado para disparos de URLs wa.me e integrações
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

  // Caso 4: Usuário digitou apenas o número sem DDD (9 ou 8 dígitos)
  // Assumir o DDD 51 por padrão (Região do Studio em São Leopoldo / RS)
  if (digits.length === 9 || digits.length === 8) {
    return `5551${digits}`;
  }

  return digits;
}

/**
 * Formata o telefone para exibição elegante com o prefixo oficial do Brasil (+55)
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
 * Máscara dinâmica para campos de input de telefone no Brasil
 * Transforma números digitados em: (51) 98047-0713
 */
export function formatBrazilianPhoneInput(value) {
  if (!value) return '';
  let digits = cleanPhoneDigits(value);

  // Se o usuário colou com 55 na frente (ex: 5551980470713), remove para manter limpo o campo com DDD
  if (digits.length >= 12 && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  // Se digitou com zero inicial (ex: 051...)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Gera URL segura de wa.me com DDI +55 garantido
 */
export function buildWhatsAppUrl(phone, message = '') {
  const waNumber = normalizeToBrazilianWhatsapp(phone);
  if (!waNumber) return '#';
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${waNumber}${query}`;
}
