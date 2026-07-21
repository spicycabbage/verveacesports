import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AiGlassesHero, AiGlassesVideoGallery } from "@/components/product/ai-glasses/AiGlassesShowcase";
import { attachDefaultVariantIds } from "@/lib/catalog/variants";

import { categoryLabel } from "@/lib/constants";

type SearchParams = Promise<{
  category?: string;
  q?: string;
  sort?: string;
}>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  if (sp.category === "ai-glasses") {
    return {
      title: "BleeqUp AI Glasses | VerveaceSports",
      description:
        "Shop BleeqUp Ranger AI sports camera glasses. Watch feature demos, athlete testimonials, and creator reviews. Authorized retailer with shipping to USA & Canada.",
    };
  }
  return { title: "Shop all products" };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const isAiGlasses = sp.category === "ai-glasses";
  const supabase = await createSupabaseServerClient();

  let q = supabase.from("products").select("*").eq("is_active", true);
  if (sp.category) q = q.eq("category", sp.category);
  if (sp.q) q = q.ilike("name", `%${sp.q}%`);

  switch (sp.sort) {
    case "name_asc":
      q = q.order("name", { ascending: true });
      break;
    default:
      q = q.order("created_at", { ascending: false });
  }

  const { data: productsRaw } = await q;
  let products = await attachDefaultVariantIds(supabase, productsRaw ?? []);

  if (sp.sort === "price_asc") {
    products = [...products].sort((a, b) => a.defaultPriceUsd - b.defaultPriceUsd);
  } else if (sp.sort === "price_desc") {
    products = [...products].sort((a, b) => b.defaultPriceUsd - a.defaultPriceUsd);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {isAiGlasses ? (
        <>
          <div className="mb-6">
            <ProductFilters />
          </div>

          <section id="shop-ranger" className="scroll-mt-24">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Shop Ranger</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {products.length} model{products.length === 1 ? "" : "s"} available · Free returns
                within 30 days · Earn 1 loyalty point per dollar
              </p>
            </div>
            <ProductGrid products={products} />
          </section>

          <AiGlassesHero className="mt-16" />
          <AiGlassesVideoGallery />
        </>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
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
        </>
      )}
    </div>
  );
}
