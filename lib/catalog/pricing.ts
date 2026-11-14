import type { Currency } from "@/lib/constants";
import { rangerVariantPriceCad } from "@/lib/catalog/ranger-sale";

/** Storefront and checkout prices always come from `product_variants`. */
export type VariantPrices = {
  priceUsd: number;
  priceCad: number;
};

export function normalizeVariantPrices(row: {
  price_usd: number | string;
  price_cad: number | string;
  sku?: string | null;
}): VariantPrices {
  const storedCad = Number(row.price_cad);
  const priceCad = rangerVariantPriceCad(row.sku, storedCad);
  return {
    priceUsd: priceCad === storedCad ? Number(row.price_usd) : priceCad,
    priceCad,
  };
}

export function pickVariantPrice(prices: VariantPrices, _currency?: Currency): number {
  return prices.priceCad;
}
