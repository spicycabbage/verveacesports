import type { SiteConfig } from "./config";
import { siteAllowsCategory } from "./config";

/** Restrict a products query to the storefront's allowed categories. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applySiteCatalogFilter<T extends { in: (column: string, values: string[]) => any }>(
  query: T,
  site: SiteConfig,
): T {
  if (site.id === "verveace") return query;
  return query.in("category", [...site.categories]) as T;
}

export function categoryAllowedOnSite(
  site: SiteConfig,
  category: string | null | undefined,
): boolean {
  if (!category) return true;
  return siteAllowsCategory(site, category);
}
