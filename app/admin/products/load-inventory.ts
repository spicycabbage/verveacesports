import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getDefaultLocation } from "@/lib/catalog/default-location";

export type AdminVariant = {
  id: string;
  title: string;
  sku: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  priceUsd: number;
  priceCad: number;
  isActive: boolean;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  image: string | null;
  isActive: boolean;
  options: unknown;
  variants: AdminVariant[];
};

export type AdminInventoryPayload = {
  location: { id: string; name: string } | null;
  products: AdminProduct[];
  error: string | null;
};

type VariantRow = {
  id: string;
  product_id: string;
  title: string;
  sku: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  price_usd: number;
  price_cad: number;
  is_active: boolean;
  position: number;
  inventory_levels?: {
    on_hand: number;
    reserved: number;
    available: number;
    reorder_point: number;
    location_id: string;
  }[];
};

export async function loadAdminProductInventory(): Promise<AdminInventoryPayload> {
  const admin = createSupabaseAdminClient();
  const [location, { data: productsData, error }] = await Promise.all([
    getDefaultLocation(),
    admin
      .from("products")
      .select("id, slug, name, category, images, is_active, options")
      .order("name")
      .limit(200),
  ]);

  if (error) {
    return { location: location ?? null, products: [], error: error.message };
  }

  const products = productsData ?? [];
  const productIds = products.map((p) => p.id);
  const { data: variantsData } = productIds.length
    ? await admin
        .from("product_variants")
        .select(
          "id, product_id, title, sku, option1, option2, option3, price_usd, price_cad, is_active, position, inventory_levels(on_hand, reserved, available, reorder_point, location_id)",
        )
        .in("product_id", productIds)
        .order("position")
    : { data: [] };

  const variantsByProduct = new Map<string, AdminVariant[]>();
  for (const variant of (variantsData ?? []) as VariantRow[]) {
    const match =
      variant.inventory_levels?.find((l) => l.location_id === location?.id) ??
      variant.inventory_levels?.[0];
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      option1: variant.option1,
      option2: variant.option2,
      option3: variant.option3,
      priceUsd: Number(variant.price_usd),
      priceCad: Number(variant.price_cad),
      isActive: variant.is_active,
      onHand: Number(match?.on_hand ?? 0),
      reserved: Number(match?.reserved ?? 0),
      available: Number(match?.available ?? 0),
      reorderPoint: Number(match?.reorder_point ?? 0),
    });
    variantsByProduct.set(variant.product_id, list);
  }

  return {
    location: location ?? null,
    error: null,
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      image: Array.isArray(p.images) ? (p.images[0] ?? null) : null,
      isActive: p.is_active,
      options: p.options,
      variants: variantsByProduct.get(p.id) ?? [],
    })),
  };
}
