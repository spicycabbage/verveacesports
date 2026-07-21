import { loadStripe, type Stripe } from "@stripe/stripe-js";
import type { Currency } from "@/lib/constants";

const stripeByCurrency = new Map<Currency, Promise<Stripe | null>>();

function publishableKeyFor(currency: Currency): string | undefined {
  return currency === "CAD"
    ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_CAD
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}

/** Returns null (never throws) when the publishable key isn't configured so the
 * checkout page can render a readable notice instead of crashing the route. */
export function getStripeClient(currency: Currency = "USD"): Promise<Stripe | null> | null {
  const key = publishableKeyFor(currency);
  if (!key) return null;
  let promise = stripeByCurrency.get(currency);
  if (!promise) {
    promise = loadStripe(key);
    stripeByCurrency.set(currency, promise);
  }
  return promise;
}
