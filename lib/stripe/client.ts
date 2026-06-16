import { loadStripe, type Stripe } from "@stripe/stripe-js";
import type { Currency } from "@/lib/constants";

const stripeByCurrency = new Map<Currency, Promise<Stripe | null>>();

function publishableKeyFor(currency: Currency): string {
  const key =
    currency === "CAD"
      ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_CAD
      : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      currency === "CAD"
        ? "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_CAD missing"
        : "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY missing",
    );
  }
  return key;
}

export function getStripeClient(currency: Currency = "USD") {
  let promise = stripeByCurrency.get(currency);
  if (!promise) {
    promise = loadStripe(publishableKeyFor(currency));
    stripeByCurrency.set(currency, promise);
  }
  return promise;
}
