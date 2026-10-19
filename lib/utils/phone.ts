/** US/CA: 10 digits, or 11 starting with country code 1. */
export function isValidOrderPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return true;
  return digits.length === 11 && digits.startsWith("1");
}

export function normalizeOrderPhone(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}
