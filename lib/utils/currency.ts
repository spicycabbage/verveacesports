import type { Currency } from "@/lib/constants";
import {
  normalizeVariantPrices,
  pickVariantPrice,
  type VariantPrices,
} from "@/lib/catalog/pricing";

/** @deprecated Use variant prices from `product_variants` via `pickVariantPrice`. */
type PriceFields = {
  price_usd: number | string;
  price_cad: number | string;
};

/** @deprecated Use `pickVariantPrice` with `normalizeVariantPrices`. */
export function pickPrice(product: PriceFields, currency: Currency): number {
  return pickVariantPrice(normalizeVariantPrices(product), currency);
}

export type { VariantPrices };

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinorUnits(amount: number): number {
  return amount / 100;
}
