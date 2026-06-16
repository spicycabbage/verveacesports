import Link from "next/link";
import Image from "next/image";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/format";
import { categoryLabel } from "@/lib/constants";
import { Pencil } from "lucide-react";

export const metadata = { title: "Admin · Catalog" };

export default async function AdminCatalogPage() {
  const admin = createSupabaseAdminClient();
  const { data: products } = await admin
    .from("products")
    .select("id, slug, name, category, images, price_usd, price_cad, is_active")
    .order("name");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
        <p className="text-sm text-muted-foreground">
          Edit product names, descriptions, photos, and storefront prices. Stock lives under{" "}
          <Link href="/admin/products" className="text-primary underline-offset-2 hover:underline">
            Inventory
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(products ?? []).map((p) => {
          const thumb = p.images?.[0];
          return (
            <Card key={p.id}>
              <CardContent className="flex gap-4 py-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium leading-tight">{p.name}</span>
                    {!p.is_active && <Badge variant="secondary">Hidden</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{categoryLabel(p.category)}</p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {formatPrice(Number(p.price_usd), "USD")} /{" "}
                    {formatPrice(Number(p.price_cad), "CAD")}
                  </p>
                  <Button size="sm" variant="outline" className="mt-1" render={<Link href={`/admin/catalog/${p.id}`} />}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(products ?? []).length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No products in the catalog.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
