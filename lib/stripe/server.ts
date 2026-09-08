import Stripe from "stripe";
import type { StripeAccountCurrency } from "@/lib/constants";

const stripeByCurrency = new Map<StripeAccountCurrency, Stripe>();

function secretFor(currency: StripeAccountCurrency): string {
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

export function getStripe(currency: StripeAccountCurrency = "CAD"): Stripe {
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

export function webhookSecretFor(currency: StripeAccountCurrency): string | undefined {
  return currency === "CAD"
    ? process.env.STRIPE_WEBHOOK_SECRET_CAD
    : process.env.STRIPE_WEBHOOK_SECRET;
}
