import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductDetailPanel } from "@/components/product/ProductDetailPanel";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductGrid } from "@/components/product/ProductGrid";
import { loadStorefrontVariants } from "@/lib/catalog/variants";
import { parseProductOptions } from "@/lib/catalog/product-options";
import { getActiveProductBySlug, getRelatedProducts } from "@/lib/catalog/queries";
import type { Product } from "@/lib/supabase/types";
import type { Metadata } from "next";
import { getSite } from "@/lib/site/get-site";
import { categoryAllowedOnSite } from "@/lib/site/catalog";
import {
  inferProductBrand,
  metaDescription,
  productBreadcrumbJsonLd,
  productMetaDescription,
  productMetaTitle,
  siteAbsoluteUrl,
} from "@/lib/site/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getProductReviews,
  getReviewEligibility,
} from "@/lib/reviews/queries";
import { summarizeReviews } from "@/lib/reviews/summary";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";
import { sizedImageUrl } from "@/lib/images/cdn";

type Params = Promise<{ slug: string }>;

// Product + related products come from "use cache" reads (lib/catalog/queries) —
// shared across requests and between generateMetadata and the page.

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [site, data] = await Promise.all([getSite(), getActiveProductBySlug(slug)]);
  if (!data) return { title: "Product" };
  if (!categoryAllowedOnSite(site, data.category)) {
    return { title: "Product", robots: { index: false, follow: false } };
  }

  const title = productMetaTitle(site, data.name);
  const description = productMetaDescription(site, data.description ?? "");
  const image = sizedImageUrl((data.images as string[] | null)?.[0], 1200);
  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: `/products/${slug}`,
      ...(image ? { images: [{ url: image, alt: data.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [site, cookieStore, supabase, product] = await Promise.all([
    getSite(),
    cookies(),
    createSupabaseServerClient(),
    getActiveProductBySlug(slug),
  ]);
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  if (!product) notFound();
  if (!categoryAllowedOnSite(site, product.category)) notFound();

  const productOptions = parseProductOptions(product.options);

  // Independent reads — fan out instead of a 6-deep await waterfall. Variant
  // availability + review eligibility are live (per-request); the rest is cached.
  const [variants, related, reviews, eligibility] = await Promise.all([
    loadStorefrontVariants(supabase, product.id, Number(product.stock)),
    getRelatedProducts({ siteId: site.id, category: product.category, excludeId: product.id }),
    getProductReviews(product.id),
    getReviewEligibility(product.id),
  ]);
  const summary = summarizeReviews(reviews);

  const productUrl = siteAbsoluteUrl(site, `/products/${product.slug}`);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: metaDescription(product.description ?? "", 5000),
    image: ((product.images as string[]) ?? []).map((src) => sizedImageUrl(src, 1200)),
    url: productUrl,
    sku: product.slug,
    brand: { "@type": "Brand", name: inferProductBrand(product.name) },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "CAD",
      price: Number(product.price_cad),
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
      <JsonLd
        data={productBreadcrumbJsonLd({
          site,
          category: product.category,
          name: product.name,
          slug: product.slug,
        })}
      />
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
