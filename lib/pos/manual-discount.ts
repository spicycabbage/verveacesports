const round2 = (n: number) => Math.round(n * 100) / 100;

export type ManualDiscount = {
  amount: number;
  label: string;
};

/** `$12`, `12.50`, `10%` — not a promo code. */
export function parsePosManualDiscount(
  raw: string,
  subtotal: number,
): ManualDiscount | null {
  const value = raw.trim();
  if (!value) return null;

  const percent = value.match(/^(\d+(?:\.\d{1,2})?)\s*%$/);
  if (percent) {
    const pct = Number(percent[1]);
    if (!Number.isFinite(pct) || pct <= 0 || pct > 100) return null;
    const amount = round2(Math.min(subtotal, (subtotal * pct) / 100));
    if (amount <= 0) return null;
    return { amount, label: `POS ${pct}%` };
  }

  const dollars = value.match(/^\$?\s*(\d+(?:\.\d{1,2})?)$/);
  if (dollars) {
    const off = round2(Number(dollars[1]));
    if (!Number.isFinite(off) || off <= 0) return null;
    const amount = round2(Math.min(subtotal, off));
    if (amount <= 0) return null;
    return { amount, label: `POS $${amount.toFixed(2)}` };
  }

  return null;
}
