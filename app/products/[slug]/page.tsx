import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductDetailPanel } from "@/components/product/ProductDetailPanel";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  attachDefaultVariantIds,
  loadStorefrontVariants,
  parseProductOptions,
} from "@/lib/catalog/variants";
import type { Product } from "@/lib/supabase/types";
import type { Metadata } from "next";
import { getSite } from "@/lib/site/get-site";
import { applySiteCatalogFilter, categoryAllowedOnSite } from "@/lib/site/catalog";
import { metaDescription, siteAbsoluteUrl } from "@/lib/site/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getProductReviews,
  getReviewEligibility,
} from "@/lib/actions/reviews";
import { summarizeReviews } from "@/lib/reviews/summary";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("name, description, images")
    .eq("slug", slug)
    .single();
  if (!data) return { title: "Product" };

  const description = metaDescription(data.description ?? "");
  const image = (data.images as string[] | null)?.[0];
  return {
    title: data.name,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: data.name,
      description,
      url: `/products/${slug}`,
      ...(image ? { images: [{ url: image, alt: data.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: data.name,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (!product) notFound();
  if (!categoryAllowedOnSite(site, product.category)) notFound();

  const variants = await loadStorefrontVariants(supabase, product.id, Number(product.stock));
  const productOptions = parseProductOptions(product.options);

  let relatedQuery = applySiteCatalogFilter(
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(4),
    site,
  );
  const { data: relatedRaw } = await relatedQuery;
  const related = await attachDefaultVariantIds(supabase, relatedRaw ?? []);

  const reviews = await getProductReviews(product.id);
  const summary = summarizeReviews(reviews);
  const eligibility = await getReviewEligibility(product.id);

  const isCad = site.lockMarket === "CA";
  const productUrl = siteAbsoluteUrl(site, `/products/${product.slug}`);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: metaDescription(product.description ?? "", 5000),
    image: (product.images as string[]) ?? [],
    url: productUrl,
    sku: product.slug,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: isCad ? "CAD" : "USD",
      price: isCad ? Number(product.price_cad) : Number(product.price_usd),
      availability:
        Number(product.stock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: site.name },
    },
    ...(summary.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: summary.average,
            reviewCount: summary.count,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.slice(0, 10).map((r) => ({
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            author: { "@type": "Person", name: r.author_display_name },
            datePublished: r.created_at,
            ...(r.title ? { name: r.title } : {}),
            reviewBody: r.body,
          })),
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden px-4 py-4 sm:py-8">
      <JsonLd data={productJsonLd} />
      <ProductDetailPanel
        product={product as Product}
        variants={variants}
        productOptions={productOptions}
        categoryLabel={categoryLabelFromDict(dict, product.category)}
        reviewSummary={summary}
      />

      <ProductReviews
        productId={product.id}
        productSlug={product.slug}
        reviews={reviews}
        summary={summary}
        eligibility={eligibility}
      />

      {related && related.length > 0 && (
        <section className="mt-10 sm:mt-16">
          <h2 className="mb-4 text-lg font-bold tracking-tight sm:text-xl">
            {dict.products.youMightAlsoLike}
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
