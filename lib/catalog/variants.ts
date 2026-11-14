import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/supabase/types";
import { normalizeVariantPrices } from "@/lib/catalog/pricing";
import { getDefaultLocation } from "@/lib/catalog/default-location";
import type { StorefrontVariant } from "@/lib/utils/variants";

/** First variant per product (lowest position) for quick-add on product cards. */
export async function attachDefaultVariantIds<T extends { id: string }>(
  client: SupabaseClient,
  products: T[],
): Promise<
  (T & {
    defaultVariantId: string;
    defaultVariantLabel: string;
    defaultPriceUsd: number;
    defaultPriceCad: number;
    defaultCompareAtCad: number | null;
  })[]
> {
  if (products.length === 0) return [];
  const ids = products.map((p) => p.id);
  const { data } = await client
    .from("product_variants")
    .select(
      "id, product_id, sku, title, option1, option2, option3, price_usd, price_cad, compare_at_cad",
    )
    .in("product_id", ids)
    .eq("is_active", true)
    .order("position", { ascending: true });

  type VariantPick = {
    id: string;
    product_id: string;
    sku: string | null;
    title: string;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    price_usd: number | string;
    price_cad: number | string;
    compare_at_cad: number | string | null;
  };
  const rows = (data ?? []) as VariantPick[];
  const byProduct = new Map<string, VariantPick>();
  for (const v of rows) {
    if (!byProduct.has(v.product_id)) byProduct.set(v.product_id, v);
  }

  return products.map((p) => {
    const v = byProduct.get(p.id);
    const parts = v ? [v.option1, v.option2, v.option3].filter(Boolean) : [];
    const prices = v ? normalizeVariantPrices(v) : { priceUsd: 0, priceCad: 0 };
    return {
      ...p,
      defaultVariantId: v?.id ?? "",
      defaultVariantLabel: parts.length > 0 ? parts.join(" / ") : (v?.title ?? "Default"),
      defaultPriceUsd: prices.priceUsd,
      defaultPriceCad: prices.priceCad,
      defaultCompareAtCad: saleCompareAt(v?.compare_at_cad, prices.priceCad),
    };
  });
}

export async function loadStorefrontVariants(
  client: SupabaseClient,
  productId: string,
  fallbackStock?: number,
): Promise<StorefrontVariant[]> {
  // Default location is cached cross-request (1h) — no per-PDP query for it.
  const [location, { data: variants }] = await Promise.all([
    getDefaultLocation(),
    client
      .from("product_variants")
      .select(
        "id, sku, option1, option2, option3, title, price_usd, price_cad, compare_at_cad, is_active, position, image_url",
      )
      .eq("product_id", productId)
      .eq("is_active", true)
      .order("position", { ascending: true }),
  ]);

  if (!variants?.length) return [];

  const variantIds = variants.map((v) => v.id);
  const levels = location
    ? (
        await client
          .from("inventory_levels")
          .select("variant_id, available")
          .eq("location_id", location.id)
          .in("variant_id", variantIds)
      ).data
    : [];

  const avail = new Map((levels ?? []).map((l) => [l.variant_id, Number(l.available)]));
  const missingInventory = (levels ?? []).length === 0;

  return variants.map((v) => {
    const prices = normalizeVariantPrices(v);
    return {
      id: v.id,
      option1: v.option1,
      option2: v.option2,
      option3: v.option3,
      title: v.title,
      ...prices,
      compareAtCad: saleCompareAt(v.compare_at_cad, prices.priceCad),
      imageUrl: v.image_url ?? null,
      available:
        missingInventory && variants.length === 1 && fallbackStock !== undefined
          ? fallbackStock
          : (avail.get(v.id) ?? 0),
    };
  });
}

function saleCompareAt(
  compare: number | string | null | undefined,
  priceCad: number,
): number | null {
  if (compare == null || compare === "") return null;
  const amount = Number(compare);
  if (!Number.isFinite(amount) || amount <= priceCad) return null;
  return amount;
}

export type ProductWithDefaultVariant = Product & {
  defaultVariantId: string;
  defaultVariantLabel: string;
  defaultPriceUsd: number;
  defaultPriceCad: number;
  defaultCompareAtCad: number | null;
};
