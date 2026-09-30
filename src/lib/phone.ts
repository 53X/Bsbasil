/** Turn a shopper's phone entry into E.164. Bare 10-digit numbers are Indian. */
export function toE164(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) {
    const international = `+${digits}`;
    return /^\+[1-9]\d{7,14}$/.test(international) ? international : null;
  }
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return null;
}
