import type { SupabaseClient } from "@supabase/supabase-js";
import type { Product, ProductOption } from "@/lib/supabase/types";
import type { StorefrontVariant } from "@/lib/utils/variants";

/** First variant per product (lowest position) for quick-add on product cards. */
export async function attachDefaultVariantIds<T extends { id: string }>(
  client: SupabaseClient,
  products: T[],
): Promise<(T & { defaultVariantId: string; defaultVariantLabel: string })[]> {
  if (products.length === 0) return [];
  const ids = products.map((p) => p.id);
  const { data } = await client
    .from("product_variants")
    .select("id, product_id, title, option1, option2, option3")
    .in("product_id", ids)
    .eq("is_active", true)
    .order("position", { ascending: true });

  type VariantPick = {
    id: string;
    product_id: string;
    title: string;
    option1: string | null;
    option2: string | null;
    option3: string | null;
  };
  const rows = (data ?? []) as VariantPick[];
  const byProduct = new Map<string, VariantPick>();
  for (const v of rows) {
    if (!byProduct.has(v.product_id)) byProduct.set(v.product_id, v);
  }

  return products.map((p) => {
    const v = byProduct.get(p.id);
    const parts = v ? [v.option1, v.option2, v.option3].filter(Boolean) : [];
    return {
      ...p,
      defaultVariantId: v?.id ?? "",
      defaultVariantLabel: parts.length > 0 ? parts.join(" / ") : (v?.title ?? "Default"),
    };
  });
}

export async function loadStorefrontVariants(
  client: SupabaseClient,
  productId: string,
): Promise<StorefrontVariant[]> {
  const { data: location } = await client
    .from("locations")
    .select("id")
    .eq("is_default", true)
    .maybeSingle();

  const { data: variants } = await client
    .from("product_variants")
    .select("id, option1, option2, option3, title, price_usd, price_cad, is_active, position")
    .eq("product_id", productId)
    .eq("is_active", true)
    .order("position", { ascending: true });

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

  return variants.map((v) => ({
    id: v.id,
    option1: v.option1,
    option2: v.option2,
    option3: v.option3,
    title: v.title,
    priceUsd: Number(v.price_usd),
    priceCad: Number(v.price_cad),
    available: avail.get(v.id) ?? 0,
  }));
}

export function parseProductOptions(raw: unknown): ProductOption[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (o): o is ProductOption =>
      typeof o === "object" &&
      o !== null &&
      typeof (o as ProductOption).name === "string" &&
      Array.isArray((o as ProductOption).values),
  );
}

export type ProductWithDefaultVariant = Product & {
  defaultVariantId: string;
  defaultVariantLabel: string;
};
