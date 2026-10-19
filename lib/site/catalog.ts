import type { SiteConfig } from "./config";
import { siteAllowsCategory } from "./config";

/** Restrict a products query to the storefront's categories and brand slug prefix. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applySiteCatalogFilter<T>(query: T, site: SiteConfig): T {
  let next = query as any;
  if (site.id !== "verveace") {
    next = next.in("category", [...site.categories]);
  }
  if (site.brand) {
    next = next.like("slug", `${site.brand}-%`);
  }
  return next as T;
}

export function categoryAllowedOnSite(
  site: SiteConfig,
  category: string | null | undefined,
): boolean {
  if (!category) return true;
  return siteAllowsCategory(site, category);
}

export function productAllowedOnSite(
  site: SiteConfig,
  product: { category?: string | null; slug?: string | null; brand?: string | null },
): boolean {
  if (!categoryAllowedOnSite(site, product.category)) return false;
  if (!site.brand) return true;
  const slug = product.slug ?? "";
  return product.brand === site.brand || slug.startsWith(`${site.brand}-`);
}
