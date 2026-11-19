/**
 * Utility for sanitizing in-trip chat messages and preventing off-platform solicitation
 */

export interface SanitizedMessageResult {
  sanitizedText: string;
  wasRedacted: boolean;
  safetyWarning?: string;
}

// Regex matching common Kenyan and international phone number patterns
// Handles variations with spaces, dots, dashes, parentheses
const PHONE_REGEXES = [
  // E.164 and international: +254... or 254...
  /(?:\+?254|0)?[\s.-]?([17]\d{2})[\s.-]?(\d{3})[\s.-]?(\d{3})/gi,
  // Standard 10-digit zero-prefixed: 07XX XXX XXX or 01XX XXX XXX
  /\b0([17]\d{2})[\s.-]?(\d{3})[\s.-]?(\d{3})\b/gi,
  // Dispersed digit sequences: e.g. 0 7 1 2 3 4 5 6 7 8
  /\b0[\s.-]?[17](?:[\s.-]?\d){8}\b/gi,
];

/**
 * Masks a phone number string, keeping the leading code and last two digits
 * e.g. "+254 712 345 678" -> "+254 7*** ***78"
 */
function maskPhoneNumber(match: string): string {
  const digits = match.replace(/\D/g, '');
  if (digits.length < 8) return '***-***-***';
  const last2 = digits.slice(-2);
  const prefix = match.startsWith('+') ? '+254 ' : match.startsWith('254') ? '254 ' : '0';
  return `${prefix}*** ***${last2}`;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

/**
 * Sanitizes in-trip chat text, redacting phone numbers and emails and flagging off-platform attempts
 */
export function sanitizeChatMessage(text: string): SanitizedMessageResult {
  if (!text || typeof text !== 'string') {
    return { sanitizedText: '', wasRedacted: false };
  }

  let sanitized = text;
  let wasRedacted = false;

  for (const regex of PHONE_REGEXES) {
    if (regex.test(sanitized)) {
      wasRedacted = true;
      sanitized = sanitized.replace(regex, (m) => maskPhoneNumber(m));
    }
  }

  if (EMAIL_REGEX.test(sanitized)) {
    wasRedacted = true;
    sanitized = sanitized.replace(EMAIL_REGEX, '[EMAIL REDACTED]');
  }

  return {
    sanitizedText: sanitized,
    wasRedacted,
    safetyWarning: wasRedacted
      ? '⚠️ In-app safety notice: For passenger & captain security, off-platform contact details are masked. All communication must remain in-app.'
      : undefined,
  };
}
