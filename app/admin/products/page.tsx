import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/lib/constants";
import { formatPrice } from "@/lib/utils/format";
import { normalizeVariantPrices } from "@/lib/catalog/pricing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseProductOptions } from "@/lib/catalog/variants";
import { productUsesVariants } from "@/lib/utils/variants";
import { VariantInventoryRow } from "./VariantInventoryRow";
import { ProductInventoryToolbar } from "./ProductInventoryToolbar";
import { ProductInventoryPagination, PAGE_SIZE } from "./ProductInventoryPagination";
import { DeleteProductButton } from "./DeleteProductButton";
import {
  ProductBulkDeleteBar,
  ProductSelectCheckbox,
  ProductSelectionProvider,
} from "./ProductBulkSelect";
import { Pencil } from "lucide-react";

export const metadata = { title: "Admin · Products" };

type SearchParams = Promise<{ category?: string; q?: string; page?: string }>;

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
};

type LevelRow = {
  variant_id: string;
  on_hand: number;
  reserved: number;
  available: number;
  reorder_point: number;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const category = sp.category?.trim() || undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = createSupabaseAdminClient();

  const { data: location } = await admin
    .from("locations")
    .select("id, name")
    .eq("is_default", true)
    .single();

  let countQuery = admin.from("products").select("id", { count: "exact", head: true });
  if (category) countQuery = countQuery.eq("category", category);
  if (q) countQuery = countQuery.ilike("name", `%${q}%`);

  const { count: totalCount, error: countError } = await countQuery;
  const total = totalCount ?? 0;

  let productsQuery = admin
    .from("products")
    .select("id, slug, name, category, images, is_active, options")
    .order("name")
    .range(from, to);
  if (category) productsQuery = productsQuery.eq("category", category);
  if (q) productsQuery = productsQuery.ilike("name", `%${q}%`);

  const { data: productsData, error } = await productsQuery;

  const products = productsData ?? [];
  const productIds = products.map((p) => p.id);

  const { data: variantsData } = await admin
    .from("product_variants")
    .select("id, product_id, title, sku, option1, option2, option3, price_usd, price_cad, is_active, position")
    .in("product_id", productIds.length ? productIds : ["00000000-0000-0000-0000-000000000000"])
    .order("position");
  const variants = (variantsData ?? []) as VariantRow[];

  const variantIds = variants.map((v) => v.id);
  const { data: levelsData } = location
    ? await admin
        .from("inventory_levels")
        .select("variant_id, on_hand, reserved, available, reorder_point")
        .eq("location_id", location.id)
        .in("variant_id", variantIds.length ? variantIds : ["00000000-0000-0000-0000-000000000000"])
    : { data: [] };
  const levels = (levelsData ?? []) as LevelRow[];
  const levelByVariant = new Map(levels.map((l) => [l.variant_id, l]));

  const variantsByProduct = new Map<string, VariantRow[]>();
  for (const v of variants) {
    const arr = variantsByProduct.get(v.product_id) ?? [];
    arr.push(v);
    variantsByProduct.set(v.product_id, arr);
  }

  const loadError = error?.message ?? countError?.message;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">
          Edit descriptions, prices, images, and inventory in one place. Stock counts are at{" "}
          <span className="font-medium">{location?.name ?? "default location"}</span>.
        </p>
      </div>

      <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}>
        <ProductInventoryToolbar />
      </Suspense>

      {loadError ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            Could not load products: {loadError}
          </CardContent>
        </Card>
      ) : !location ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            No default warehouse found. Commerce migrations (0003–0005) may not be applied on this
            database — contact support or run them in Supabase SQL.
          </CardContent>
        </Card>
      ) : (
        <>
          <ProductSelectionProvider
            products={products.map((p) => ({ id: p.id, name: p.name }))}
          >
            <ProductBulkDeleteBar products={products.map((p) => ({ id: p.id, name: p.name }))} />
            <div className="space-y-4">
            {products.map((p) => {
              const pv = variantsByProduct.get(p.id) ?? [];
              const productOptions = parseProductOptions(p.options);
              const usesVariants = productUsesVariants(pv, productOptions);
              const thumb = p.images?.[0];
              const singleVariant = !usesVariants && pv.length === 1 ? pv[0] : null;
              const singleLevel = singleVariant ? levelByVariant.get(singleVariant.id) : null;
              const primaryVariant = pv[0];
              const listPrices = primaryVariant
                ? normalizeVariantPrices(primaryVariant)
                : { priceUsd: 0, priceCad: 0 };
              const lowStock = pv.some((v) => {
                const lvl = levelByVariant.get(v.id);
                return lvl && lvl.available <= lvl.reorder_point;
              });
              return (
                <Card key={p.id}>
                  <CardContent className="py-4">
                    <div className="flex flex-wrap items-start gap-4">
                      <ProductSelectCheckbox productId={p.id} />
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {thumb ? (
                          <Image src={thumb} alt="" fill sizes="80px" className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium leading-tight">{p.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {categoryLabel(p.category)}
                          </span>
                          {!p.is_active && <Badge variant="secondary">Hidden</Badge>}
                          {lowStock && <Badge variant="destructive">Low stock</Badge>}
                        </div>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {formatPrice(listPrices.priceUsd, "USD")} /{" "}
                          {formatPrice(listPrices.priceCad, "CAD")}
                          {usesVariants && pv.length > 1 ? " · default variant" : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            render={<Link href={`/admin/products/${p.id}`} />}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit product
                          </Button>
                          <DeleteProductButton
                            productId={p.id}
                            productName={p.name}
                            variant="compact"
                          />
                        </div>
                      </div>
                      {singleVariant && singleLevel && (
                        <VariantInventoryRow
                          locationId={location.id}
                          inline
                          productId={p.id}
                          productIsActive={p.is_active}
                          variant={{
                            id: singleVariant.id,
                            title: singleVariant.title,
                            sku: singleVariant.sku,
                            options: "",
                            priceUsd: Number(singleVariant.price_usd),
                            priceCad: Number(singleVariant.price_cad),
                            isActive: singleVariant.is_active,
                          }}
                          level={{
                            onHand: Number(singleLevel.on_hand),
                            reserved: Number(singleLevel.reserved),
                            available: Number(singleLevel.available),
                          }}
                        />
                      )}
                    </div>
                    {usesVariants && (
                      <div className="mt-3 divide-y border-t pt-2">
                        {pv.map((v) => {
                          const lvl = levelByVariant.get(v.id);
                          return (
                            <VariantInventoryRow
                              key={v.id}
                              locationId={location.id}
                              variant={{
                                id: v.id,
                                title: v.title,
                                sku: v.sku,
                                options: [v.option1, v.option2, v.option3].filter(Boolean).join(" / "),
                                priceUsd: Number(v.price_usd),
                                priceCad: Number(v.price_cad),
                                isActive: v.is_active,
                              }}
                              level={{
                                onHand: lvl ? Number(lvl.on_hand) : 0,
                                reserved: lvl ? Number(lvl.reserved) : 0,
                                available: lvl ? Number(lvl.available) : 0,
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                    {pv.length === 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">No inventory record.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {products.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  {q || category ? "No products match your filters." : "No products found."}
                </CardContent>
              </Card>
            )}
          </div>
          </ProductSelectionProvider>
          <ProductInventoryPagination page={page} total={total} category={category} q={q} />
        </>
      )}
    </div>
  );
}
