/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Phone Number Normalization, Formatting, and Direct Contact Link Builders.
 * Single source of truth for WhatsApp and Hotline links across KEY OF DAVID.
 */

/**
 * Normalizes phone input by stripping whitespace, dashes, parens, brackets, and leading +.
 * Handles Nigerian local format (11 digits starting with 0 -> replaces leading 0 with 234).
 * Rejects numbers outside 10-15 digits with a descriptive error.
 */
export function normalizePhone(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Please enter a phone number.');
  }

  // Remove spaces, dashes, parentheses, brackets, dots, and leading +
  let cleaned = input.replace(/[\s\-\(\)\[\]\.\+]/g, '').trim();

  // If input had letters or invalid symbols, reject
  if (/[^\d]/.test(cleaned)) {
    throw new Error('Phone number must contain digits only.');
  }

  // Nigerian local format: 11 digits starting with 0 (e.g. 09042725844 -> 2349042725844)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }

  // Length validation: standard international E.164 numbers are 10 to 15 digits
  if (cleaned.length < 10) {
    throw new Error(`Phone number is too short (${cleaned.length} digits). Minimum is 10 digits.`);
  }

  if (cleaned.length > 15) {
    throw new Error(`Phone number is too long (${cleaned.length} digits). Maximum is 15 digits.`);
  }

  return cleaned;
}

/**
 * Validates phone number and returns a safe result without throwing.
 */
export function validatePhone(input: string): { valid: boolean; normalized: string; error?: string } {
  try {
    const normalized = normalizePhone(input);
    return { valid: true, normalized };
  } catch (err: any) {
    return { valid: false, normalized: '', error: err.message || 'Invalid phone number' };
  }
}

/**
 * Formats digits for human display.
 * For Nigerian numbers (starts with 234 and is 13 digits e.g. 2349042725844):
 * Displays local standard: "0904 272 5844".
 * Otherwise displays "+" followed by the digits.
 */
export function formatPhoneDisplay(digits: string): string {
  if (!digits) return '';

  const clean = digits.replace(/[^\d]/g, '');

  // Nigerian number: 234 + 10 digits (total 13 digits)
  // e.g. 234 904 272 5844 -> 0904 272 5844
  if (clean.startsWith('234') && clean.length === 13) {
    const local = '0' + clean.substring(3); // "09042725844"
    const part1 = local.substring(0, 4);    // "0904"
    const part2 = local.substring(4, 7);    // "272"
    const part3 = local.substring(7);       // "5844"
    return `${part1} ${part2} ${part3}`;
  }

  // Standard international display
  return `+${clean}`;
}

/**
 * Builds WhatsApp click-to-chat URL.
 * Never builds the link anywhere else.
 */
export function buildWhatsAppLink(number: string, message: string): string {
  const digits = normalizePhone(number);
  const encodedText = encodeURIComponent(message || '');
  return `https://wa.me/${digits}${encodedText ? `?text=${encodedText}` : ''}`;
}

/**
 * Builds direct tel: protocol link.
 * Never builds the link anywhere else.
 */
export function buildTelLink(number: string): string {
  const digits = normalizePhone(number);
  return `tel:+${digits}`;
}
