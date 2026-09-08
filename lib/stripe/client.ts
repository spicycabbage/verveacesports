import { loadStripe, type Stripe } from "@stripe/stripe-js";
import type { Currency } from "@/lib/constants";

const stripeByCurrency = new Map<Currency, Promise<Stripe | null>>();

function publishableKeyFor(_currency: Currency): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_CAD;
}

/** Returns null (never throws) when the publishable key isn't configured so the
 * checkout page can render a readable notice instead of crashing the route. */
export function getStripeClient(_currency: Currency = "CAD"): Promise<Stripe | null> | null {
  const key = publishableKeyFor("CAD");
  if (!key) return null;
  let promise = stripeByCurrency.get("CAD");
  if (!promise) {
    promise = loadStripe(key);
    stripeByCurrency.set("CAD", promise);
  }
  return promise;
}
