import Stripe from "stripe";
import type { Currency } from "@/lib/constants";

const stripeByCurrency = new Map<Currency, Stripe>();

function secretFor(currency: Currency): string {
  const key =
    currency === "CAD"
      ? process.env.STRIPE_SECRET_KEY_CAD
      : process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      currency === "CAD"
        ? "STRIPE_SECRET_KEY_CAD missing (Canadian Stripe account)"
        : "STRIPE_SECRET_KEY missing",
    );
  }
  return key;
}

export function getStripe(currency: Currency = "USD"): Stripe {
  let stripe = stripeByCurrency.get(currency);
  if (!stripe) {
    stripe = new Stripe(secretFor(currency), {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    });
    stripeByCurrency.set(currency, stripe);
  }
  return stripe;
}

export function webhookSecretFor(currency: Currency): string | undefined {
  return currency === "CAD"
    ? process.env.STRIPE_WEBHOOK_SECRET_CAD
    : process.env.STRIPE_WEBHOOK_SECRET;
}
