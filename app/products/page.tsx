import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { attachDefaultVariantIds } from "@/lib/catalog/variants";

import { categoryLabel } from "@/lib/constants";

export const metadata = { title: "Shop all products" };

type SearchParams = Promise<{
  category?: string;
  q?: string;
  sort?: string;
}>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();

  let q = supabase.from("products").select("*").eq("is_active", true);
  if (sp.category) q = q.eq("category", sp.category);
  if (sp.q) q = q.ilike("name", `%${sp.q}%`);

  switch (sp.sort) {
    case "price_asc":
      q = q.order("price_usd", { ascending: true });
      break;
    case "price_desc":
      q = q.order("price_usd", { ascending: false });
      break;
    case "name_asc":
      q = q.order("name", { ascending: true });
      break;
    default:
      q = q.order("created_at", { ascending: false });
  }

  const { data: productsRaw } = await q;
  const products = await attachDefaultVariantIds(supabase, productsRaw ?? []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {sp.category ? categoryLabel(sp.category) : "All products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} product{products.length === 1 ? "" : "s"}
          {sp.q ? ` for "${sp.q}"` : ""}
        </p>
      </div>
      <div className="mb-6">
        <ProductFilters />
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
