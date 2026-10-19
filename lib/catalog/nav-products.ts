import { cacheLife, cacheTag } from "next/cache";
import type { Category } from "@/lib/constants";
import type { NavMegaProduct } from "@/components/layout/HeaderCategoryNav";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { CATALOG_CACHE_LIFE, CATALOG_TAG } from "@/lib/catalog/tags";
import { isMissingColumn } from "@/lib/supabase/order-row";

type NavProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  images: unknown;
  translations?: unknown;
};

function productImage(images: unknown): string | null {
  if (!Array.isArray(images)) return null;
  const first = images.find((img): img is string => typeof img === "string" && img.length > 0);
  return first ?? null;
}

async function loadNavProducts(
  categories: readonly string[],
  slugPrefix: string | null,
): Promise<{
  byCategory: Record<string, NavMegaProduct[]>;
  electricCartProducts: NavMegaProduct[];
}> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { byCategory: {}, electricCartProducts: [] };
  }

  const supabase = createSupabasePublicClient();
  const scoped = (columns: string) => {
    let q = supabase
      .from("products")
      .select(columns)
      .eq("is_active", true)
      .in("category", [...categories])
      .order("created_at", { ascending: false });
    if (slugPrefix) q = q.like("slug", `${slugPrefix}%`);
    return q;
  };
  let { data, error } = await scoped(
    "id, slug, name, category, images, translations",
  ).overrideTypes<NavProductRow[]>();
  if (error && isMissingColumn(error.message, "translations")) {
    const retry = await scoped("id, slug, name, category, images").overrideTypes<NavProductRow[]>();
    data = retry.data;
  }

  const byCategory: Record<string, NavMegaProduct[]> = {};
  const electricCartProducts: NavMegaProduct[] = [];

  for (const row of (data ?? []) as NavProductRow[]) {
    const category = row.category;
    if (!category) continue;
    const product: NavMegaProduct = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      image: productImage(row.images),
      translations: row.translations,
    };
    if (category === "electric-carts") {
      electricCartProducts.push(product);
      continue;
    }
    const list = byCategory[category] ?? [];
    if (list.length >= 5) continue;
    list.push(product);
    byCategory[category] = list;
  }

  return { byCategory, electricCartProducts };
}

export async function getCachedNavProducts(
  categories: readonly Category[],
  slugPrefix: string | null = null,
) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife(CATALOG_CACHE_LIFE);
  return loadNavProducts(categories, slugPrefix);
}
