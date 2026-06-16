import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { VariantInventoryRow } from "./VariantInventoryRow";

export const metadata = { title: "Admin · Inventory" };

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

export default async function AdminInventoryPage() {
  const admin = createSupabaseAdminClient();

  const { data: location } = await admin
    .from("locations")
    .select("id, name")
    .eq("is_default", true)
    .single();

  const { data: productsData, error } = await admin
    .from("products")
    .select("id, slug, name, category, is_active")
    .order("name");

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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Per-variant on-hand, reserved, and available stock at{" "}
          <span className="font-medium">{location?.name ?? "default location"}</span>. Receive stock
          with <span className="font-medium">+/−</span>, or set an exact count after a cycle count.
          USD/CAD prices are edited under{" "}
          <Link href="/admin/catalog" className="text-primary underline-offset-2 hover:underline">
            Catalog
          </Link>
          .
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            Could not load inventory: {error.message}
          </CardContent>
        </Card>
      ) : !location ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            No default warehouse found. Commerce migrations (0003–0005) may not be applied on
            this database — contact support or run them in Supabase SQL.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((p) => {
            const pv = variantsByProduct.get(p.id) ?? [];
            const lowStock = pv.some((v) => {
              const lvl = levelByVariant.get(v.id);
              return lvl && lvl.available <= lvl.reorder_point;
            });
            return (
              <Card key={p.id}>
                <CardContent className="space-y-1 py-4">
                  <div className="flex items-center justify-between gap-2 pb-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${p.slug}`}
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {p.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{categoryLabel(p.category)}</span>
                      {!p.is_active && <Badge variant="secondary">Hidden</Badge>}
                    </div>
                    {lowStock && <Badge variant="destructive">Low stock</Badge>}
                  </div>
                  <div className="divide-y">
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
                    {pv.length === 0 && (
                      <p className="py-2 text-xs text-muted-foreground">No variants.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {products.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No products found.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
