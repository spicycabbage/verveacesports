import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { AiGlassesHero, AiGlassesVideoGallery } from "@/components/product/ai-glasses/AiGlassesShowcase";
import { RoverShowcase } from "@/components/product/rover/RoverShowcase";
import { roverCopy } from "@/lib/i18n/rover-copy";
import { ROVER_PRIMARY_SLUG } from "@/lib/content/bleequp-rover";
import {
  listStorefrontProducts,
  parseCatalogSort,
  sanitizeCatalogSearch,
} from "@/lib/catalog/queries";
import { getSite } from "@/lib/site/get-site";
import { categoryAllowedOnSite } from "@/lib/site/catalog";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";
import { categoryLabelFromDict, siteDescription } from "@/lib/i18n/helpers";

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
      title:
        site.id === "bleeq-ca"
          ? dict.products.shopRangerBleeq
          : `${dict.products.shopRanger} | ${site.name}`,
      description:
        site.id === "bleeq-ca" ? dict.products.rangerMetaDesc : dict.products.aiGlassesMetaDesc,
      alternates: { canonical: "/products?category=ai-glasses" },
    };
  }
  return {
    title:
      site.id === "bleeq-ca"
        ? { absolute: dict.products.shopBleeqCanada }
        : dict.products.shopAllTitle,
    description: siteDescription(dict, site.id),
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
  const locale = parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = getDictionary(locale);
  const sp = await searchParams;

  if (sp.category && !categoryAllowedOnSite(site, sp.category)) {
    notFound();
  }

  const isAiGlasses = sp.category === "ai-glasses";

  // Cross-request cached ("use cache", tag: catalog) — keyed by site/category/q/sort.
  const products = await listStorefrontProducts({
    siteId: site.id,
    category: sp.category,
    search: sanitizeCatalogSearch(sp.q),
    sort: parseCatalogSort(sp.sort),
  });

  const countLabel = sp.q
    ? interpolate(dict.products.countForQuery, { n: products.length, query: sp.q })
    : interpolate(dict.products.count, { n: products.length });

  return (
    <div className="mx-auto min-w-0 max-w-7xl overflow-x-clip px-4 py-8">
      {isAiGlasses ? (
        <>
          <section id="shop-ranger" className="scroll-mt-24">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {site.id === "bleeq-ca"
                  ? dict.products.shopRangerBleeq
                  : dict.products.shopRanger}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {interpolate(dict.products.rangerMeta, { n: products.length })}{" "}
                <Link href="/compare" className="text-foreground underline-offset-4 hover:underline">
                  {roverCopy(locale).compare.title}
                </Link>
              </p>
            </div>

            <div className="mb-6">
              <ProductFilters categories={site.categories} />
            </div>

            <ProductGrid products={products} />
          </section>

          {site.id === "bleeq-ca" ? (
            <RoverShowcase
              copy={roverCopy(locale)}
              ctaHref={`/products/${ROVER_PRIMARY_SLUG}`}
              className="mt-16"
            />
          ) : (
            <>
              <AiGlassesHero className="mt-16" />
              <AiGlassesVideoGallery />
            </>
          )}
        </>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {sp.category
                ? categoryLabelFromDict(dict, sp.category)
                : site.id === "bleeq-ca"
                  ? dict.products.shopBleeqCanada
                  : dict.products.allProducts}
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
