import { cacheLife, cacheTag } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Product } from "@/lib/supabase/types";
import { getSiteById } from "@/lib/site/get-site";
import type { SiteId } from "@/lib/site/config";
import { applySiteCatalogFilter } from "@/lib/site/catalog";
import { attachDefaultVariantIds, type ProductWithDefaultVariant } from "@/lib/catalog/variants";
import { CATALOG_CACHE_LIFE, CATALOG_TAG } from "@/lib/catalog/tags";

// Cross-request cached storefront reads ("use cache"). Everything here is
// public data keyed by plain serializable args — never read cookies()/headers()
// inside; resolve the site/locale in the caller and pass ids down.
//
// Live per-variant availability (loadStorefrontVariants) is deliberately NOT
// cached: add-to-cart must see real inventory.

export type CatalogSort = "newest" | "name_asc" | "price_asc" | "price_desc";

export function parseCatalogSort(raw: string | undefined): CatalogSort {
  switch (raw) {
    case "name_asc":
    case "price_asc":
    case "price_desc":
      return raw;
    default:
      return "newest";
  }
}

/** Bound + strip LIKE wildcards so a crafted `q` can't become a full-table pattern scan. */
export function sanitizeCatalogSearch(raw: string | undefined): string {
  return (raw ?? "").replace(/[%_\\]/g, " ").trim().slice(0, 80);
}

export async function listStorefrontProducts(opts: {
  siteId: SiteId;
  category?: string;
  search?: string;
  sort?: CatalogSort;
  limit?: number;
}): Promise<ProductWithDefaultVariant[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife(CATALOG_CACHE_LIFE);

  const site = getSiteById(opts.siteId);
  const supabase = createSupabasePublicClient();

  let q = applySiteCatalogFilter(
    supabase.from("products").select("*").eq("is_active", true),
    site,
  );
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.search) q = q.ilike("name", `%${opts.search}%`);

  switch (opts.sort) {
    case "name_asc":
      q = q.order("name", { ascending: true });
      break;
    case "newest":
    case "price_asc":
    case "price_desc":
    case undefined:
      q = q.order("created_at", { ascending: false });
      break;
    default: {
      const _exhaustive: never = opts.sort;
      return _exhaustive;
    }
  }
  if (opts.limit) q = q.limit(opts.limit);

  const { data } = await q;
  const products = await attachDefaultVariantIds(supabase, (data ?? []) as Product[]);

  if (opts.sort === "price_asc") {
    return [...products].sort((a, b) => a.defaultPriceCad - b.defaultPriceCad);
  }
  if (opts.sort === "price_desc") {
    return [...products].sort((a, b) => b.defaultPriceCad - a.defaultPriceCad);
  }
  return products;
}

export async function getActiveProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife(CATALOG_CACHE_LIFE);

  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return (data as Product | null) ?? null;
}

export async function getRelatedProducts(opts: {
  siteId: SiteId;
  category: string;
  excludeId: string;
  limit?: number;
}): Promise<ProductWithDefaultVariant[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife(CATALOG_CACHE_LIFE);

  const site = getSiteById(opts.siteId);
  const supabase = createSupabasePublicClient();
  const { data } = await applySiteCatalogFilter(
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category", opts.category)
      .neq("id", opts.excludeId)
      .limit(opts.limit ?? 4),
    site,
  );
  return attachDefaultVariantIds(supabase, (data ?? []) as Product[]);
}

/** Active storefront products for the given slugs, in the order requested. */
export async function listStorefrontProductsBySlugs(opts: {
  siteId: SiteId;
  slugs: readonly string[];
}): Promise<ProductWithDefaultVariant[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife(CATALOG_CACHE_LIFE);

  if (opts.slugs.length === 0) return [];
  const site = getSiteById(opts.siteId);
  const supabase = createSupabasePublicClient();
  const { data } = await applySiteCatalogFilter(
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .in("slug", [...opts.slugs]),
    site,
  );
  const products = await attachDefaultVariantIds(supabase, (data ?? []) as Product[]);
  const rank = new Map(opts.slugs.map((slug, i) => [slug, i]));
  return products.sort((a, b) => (rank.get(a.slug) ?? 0) - (rank.get(b.slug) ?? 0));
}

export async function listSitemapProducts(
  siteId: SiteId,
): Promise<{ slug: string; created_at: string }[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const site = getSiteById(siteId);
  const supabase = createSupabasePublicClient();
  const { data } = await applySiteCatalogFilter(
    supabase.from("products").select("slug, created_at").eq("is_active", true),
    site,
  );
  return (data ?? []) as { slug: string; created_at: string }[];
}
