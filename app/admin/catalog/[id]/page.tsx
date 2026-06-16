import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProductEditor } from "../ProductEditor";
import { VariantManager, type AdminVariantRow } from "../VariantManager";
import { parseProductOptions } from "@/lib/catalog/variants";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Category } from "@/lib/constants";

export const metadata = { title: "Admin · Edit product" };

type Params = Promise<{ id: string }>;

export default async function AdminCatalogEditPage({ params }: { params: Params }) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data: product } = await admin
    .from("products")
    .select(
      "id, slug, name, description, category, images, price_usd, price_cad, is_active, options",
    )
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: location } = await admin
    .from("locations")
    .select("id")
    .eq("is_default", true)
    .maybeSingle();

  const { data: variantsData } = await admin
    .from("product_variants")
    .select("id, sku, title, option1, option2, option3, price_usd, price_cad, is_active, position")
    .eq("product_id", id)
    .order("position");

  const variantIds = (variantsData ?? []).map((v) => v.id);
  const { data: levelsData } = location
    ? await admin
        .from("inventory_levels")
        .select("variant_id, available")
        .eq("location_id", location.id)
        .in("variant_id", variantIds.length ? variantIds : ["00000000-0000-0000-0000-000000000000"])
    : { data: [] };

  const avail = new Map((levelsData ?? []).map((l) => [l.variant_id, Number(l.available)]));
  const variants: AdminVariantRow[] = (variantsData ?? []).map((v) => ({
    id: v.id,
    sku: v.sku,
    title: v.title,
    option1: v.option1,
    option2: v.option2,
    option3: v.option3,
    priceUsd: Number(v.price_usd),
    priceCad: Number(v.price_cad),
    isActive: v.is_active,
    available: avail.get(v.id) ?? 0,
  }));

  const productOptions = parseProductOptions(product.options);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/admin/catalog" className="gap-1.5" />}
        >
          <ArrowLeft className="h-4 w-4" />
          Catalog
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
        <p className="font-mono text-xs text-muted-foreground">/products/{product.slug}</p>
      </div>
      <ProductEditor
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          category: product.category as Category,
          images: product.images ?? [],
          priceUsd: Number(product.price_usd),
          priceCad: Number(product.price_cad),
          isActive: product.is_active,
        }}
      />
      <VariantManager
        productId={product.id}
        productOptions={productOptions}
        variants={variants}
        defaultPriceUsd={Number(product.price_usd)}
        defaultPriceCad={Number(product.price_cad)}
      />
    </div>
  );
}
