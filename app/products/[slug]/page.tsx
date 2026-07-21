import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductDetailPanel } from "@/components/product/ProductDetailPanel";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  attachDefaultVariantIds,
  loadStorefrontVariants,
  parseProductOptions,
} from "@/lib/catalog/variants";
import type { Product } from "@/lib/supabase/types";
import type { Metadata } from "next";
import { categoryLabel } from "@/lib/constants";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("products").select("name").eq("slug", slug).single();
  return { title: data?.name ?? "Product" };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (!product) notFound();

  const variants = await loadStorefrontVariants(supabase, product.id, Number(product.stock));
  const productOptions = parseProductOptions(product.options);

  const { data: relatedRaw } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(4);
  const related = await attachDefaultVariantIds(supabase, relatedRaw ?? []);

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden px-4 py-4 sm:py-8">
      <ProductDetailPanel
        product={product as Product}
        variants={variants}
        productOptions={productOptions}
        categoryLabel={categoryLabel(product.category)}
      />

      {related && related.length > 0 && (
        <section className="mt-10 sm:mt-16">
          <h2 className="mb-4 text-lg font-bold tracking-tight sm:text-xl">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
