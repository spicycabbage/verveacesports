import type { Currency } from "@/lib/constants";

/** Storefront and checkout prices always come from `product_variants`. */
export type VariantPrices = {
  priceUsd: number;
  priceCad: number;
};

export function normalizeVariantPrices(row: {
  price_usd: number | string;
  price_cad: number | string;
}): VariantPrices {
  return {
    priceUsd: Number(row.price_usd),
    priceCad: Number(row.price_cad),
  };
}

export function pickVariantPrice(prices: VariantPrices, currency: Currency): number {
  return currency === "CAD" ? prices.priceCad : prices.priceUsd;
}
