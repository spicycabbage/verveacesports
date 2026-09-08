/**
 * Cache tags + lifetimes for `"use cache"` storefront reads
 * (lib/catalog/queries.ts, lib/catalog/nav-products.ts, lib/reviews/queries.ts).
 *
 * Every product/variant/inventory mutation must invalidate CATALOG_TAG via
 * lib/catalog/invalidate.ts — `products.stock` is a denormalized mirror kept in
 * sync by DB triggers, so order reservations/commits change listing data too.
 *
 * No next/cache imports here: this module is safe to import from Client Components.
 */
export const CATALOG_TAG = "catalog";
export const LOCATIONS_TAG = "locations";

/**
 * cacheLife() for storefront product rows. `products.stock` moves on every
 * order, so the server-side revalidate is short; mutations also expire
 * CATALOG_TAG explicitly, this is just the safety net.
 */
export const CATALOG_CACHE_LIFE = {
  stale: 300,
  revalidate: 60,
  expire: 3600,
} as const;

export function reviewsTag(productId: string): string {
  return `reviews:${productId}`;
}
