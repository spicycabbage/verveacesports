import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Gallery } from "@/components/product/Gallery";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  attachDefaultVariantIds,
  loadStorefrontVariants,
  parseProductOptions,
} from "@/lib/catalog/variants";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Truck, Sparkles } from "lucide-react";
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

  const variants = await loadStorefrontVariants(supabase, product.id);
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Gallery images={product.images ?? []} alt={product.name} />
        <div className="space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {categoryLabel(product.category)}
            </span>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <ProductBuyBox
            product={product as Product}
            variants={variants}
            productOptions={productOptions}
          />

          <Separator />
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" /> Free shipping on orders over $75 (USA &amp; CA)
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> 30-day hassle-free returns
            </li>
            <li className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Earn {Math.floor(Number(product.price_usd))} points on this order
            </li>
          </ul>
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-xl font-bold tracking-tight">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
