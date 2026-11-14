/**
 * Ranger glasses promo. Charged price is the variant row; this window forces the
 * sale amount through December 1, 2026 00:00 America/Edmonton (UTC-7), then puts
 * the previous CAD price back when the row is still the sale amount.
 *
 * Pink-purple Standard was $539; the other Standard frames were $529.
 */
const RANGER_SALE_ENDS_AT = Date.parse("2026-12-01T07:00:00.000Z");

type RangerPrice = { sale: number; regular: number };

const BY_SKU: Record<string, RangerPrice> = {
  "10100029": { sale: 539, regular: 609 },
  "10100025": { sale: 479, regular: 529 },
  "10100027": { sale: 479, regular: 529 },
  "10100026": { sale: 479, regular: 539 },
};

const BY_SLUG: Record<string, RangerPrice> = {
  "bleequp-ranger-zeiss-lens": { sale: 539, regular: 609 },
  "bleequp-ranger-standard-lens": { sale: 479, regular: 529 },
};

function applyRangerPrice(row: RangerPrice | undefined, priceCad: number, now: number): number {
  if (!row) return priceCad;
  if (now < RANGER_SALE_ENDS_AT) return row.sale;
  if (Math.round(priceCad * 100) === Math.round(row.sale * 100)) return row.regular;
  return priceCad;
}

export function rangerVariantPriceCad(
  sku: string | null | undefined,
  priceCad: number,
  now = Date.now(),
): number {
  if (!sku) return priceCad;
  return applyRangerPrice(BY_SKU[sku], priceCad, now);
}

export function rangerProductPriceCad(slug: string, priceCad: number, now = Date.now()): number {
  return applyRangerPrice(BY_SLUG[slug], priceCad, now);
}
