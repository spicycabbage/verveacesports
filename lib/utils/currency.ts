import type { Currency } from "@/lib/constants";

type PriceFields = {
  price_usd: number | string;
  price_cad: number | string;
};

export function pickPrice(product: PriceFields, currency: Currency): number {
  const value = currency === "CAD" ? product.price_cad : product.price_usd;
  return typeof value === "string" ? Number(value) : value;
}

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinorUnits(amount: number): number {
  return amount / 100;
}
