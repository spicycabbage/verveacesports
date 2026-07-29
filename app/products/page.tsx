import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AiGlassesHero, AiGlassesVideoGallery } from "@/components/product/ai-glasses/AiGlassesShowcase";
import { attachDefaultVariantIds } from "@/lib/catalog/variants";
import { getSite } from "@/lib/site/get-site";
import { applySiteCatalogFilter, categoryAllowedOnSite } from "@/lib/site/catalog";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";

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
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const sp = await searchParams;
  if (sp.category === "ai-glasses") {
    return {
      title: `${dict.products.shopRanger} | ${site.name}`,
      description:
        site.id === "bleeq-ca"
          ? "Shop BleeqUp Ranger AI sports camera glasses in Canada. CAD pricing, free returns within 30 days."
          : "Shop BleeqUp Ranger AI sports camera glasses. Watch feature demos, athlete testimonials, and creator reviews. Authorized retailer with shipping to USA & Canada.",
      alternates: { canonical: "/products?category=ai-glasses" },
    };
  }
  return {
    title: dict.products.shopAllTitle,
    description: site.description,
    alternates: {
      canonical: sp.category
        ? `/products?category=${sp.category}`
        : "/products",
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const sp = await searchParams;

  if (sp.category && !categoryAllowedOnSite(site, sp.category)) {
    notFound();
  }

  const isAiGlasses = sp.category === "ai-glasses";
  const supabase = await createSupabaseServerClient();

  let q = applySiteCatalogFilter(
    supabase.from("products").select("*").eq("is_active", true),
    site,
  );
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

  const countLabel = sp.q
    ? interpolate(dict.products.countForQuery, { n: products.length, query: sp.q })
    : interpolate(dict.products.count, { n: products.length });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {isAiGlasses ? (
        <>
          <div className="mb-6">
            <ProductFilters categories={site.categories} />
          </div>

          <section id="shop-ranger" className="scroll-mt-24">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {dict.products.shopRanger}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {interpolate(dict.products.rangerMeta, { n: products.length })}
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
              {sp.category ? categoryLabelFromDict(dict, sp.category) : dict.products.allProducts}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{countLabel}</p>
          </div>

          <div className="mb-6">
            <ProductFilters categories={site.categories} />
          </div>

          <ProductGrid products={products} />
        </>
      )}
    </div>
  );
}
