import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductDetailPanel } from "@/components/product/ProductDetailPanel";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductGrid } from "@/components/product/ProductGrid";
import { rangerProductPriceCad } from "@/lib/catalog/ranger-sale";
import { loadStorefrontVariants } from "@/lib/catalog/variants";
import { descriptionFaq, descriptionPlainText } from "@/lib/catalog/description";
import { parseProductOptions } from "@/lib/catalog/product-options";
import { getActiveProductBySlug, getRelatedProducts } from "@/lib/catalog/queries";
import type { Product } from "@/lib/supabase/types";
import type { Metadata } from "next";
import { getSite } from "@/lib/site/get-site";
import { productAllowedOnSite } from "@/lib/site/catalog";
import { productMetaCloser } from "@/lib/i18n/helpers";
import {
  inferProductBrand,
  merchantReturnPolicyJsonLd,
  metaDescription,
  offerShippingDetailsJsonLd,
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
import { localizeProduct } from "@/lib/i18n/catalog-copy";
import { roverCopy } from "@/lib/i18n/rover-copy";
import { isRoverGlassesSlug } from "@/lib/content/bleequp-rover";
import { RoverShowcase } from "@/components/product/rover/RoverShowcase";
import { sizedImageUrl } from "@/lib/images/cdn";

type Params = Promise<{ slug: string }>;

// Product + related products come from "use cache" reads (lib/catalog/queries) —
// shared across requests and between generateMetadata and the page.

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [site, cookieStore, data] = await Promise.all([
    getSite(),
    cookies(),
    getActiveProductBySlug(slug),
  ]);
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  if (!data) return { title: "Product" };
  if (!productAllowedOnSite(site, data)) {
    return { title: "Product", robots: { index: false, follow: false } };
  }

  const locale = parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value);
  const localized = localizeProduct(data, locale);
  const title = productMetaTitle(site, localized.name);
  const closer = productMetaCloser(dict, site.id);
  const description = productMetaDescription(
    site,
    descriptionPlainText(localized.description),
    closer,
  );
  const image = sizedImageUrl((data.images as string[] | null)?.[0], 1200);
  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: `/products/${slug}`,
      ...(image ? { images: [{ url: image, alt: localized.name }] } : {}),
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
  const locale = parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = getDictionary(locale);
  if (!product) notFound();
  if (!productAllowedOnSite(site, product)) notFound();
  const localized = localizeProduct(product, locale);

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
    name: localized.name,
    description: metaDescription(descriptionPlainText(localized.description), 5000),
    image: ((product.images as string[]) ?? []).map((src) => sizedImageUrl(src, 1200)),
    url: productUrl,
    sku: product.slug,
    brand: { "@type": "Brand", name: inferProductBrand(localized.name) },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "CAD",
      price: rangerProductPriceCad(product.slug, Number(product.price_cad)),
      availability:
        Number(product.stock) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: site.name },
      hasMerchantReturnPolicy: merchantReturnPolicyJsonLd(site),
      shippingDetails: offerShippingDetailsJsonLd(
        site,
        rangerProductPriceCad(product.slug, Number(product.price_cad)),
      ),
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
  const faq = descriptionFaq(localized.description);
  const faqJsonLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
      }
    : null;

  return (
    <div id="product" className="mx-auto min-w-0 max-w-7xl scroll-mt-24 overflow-x-clip px-4 py-4 sm:py-8">
      <JsonLd data={productJsonLd} />
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      <JsonLd
        data={productBreadcrumbJsonLd({
          site,
          category: product.category,
          name: localized.name,
          slug: product.slug,
          homeLabel: dict.common.home,
          categoryLabel: categoryLabelFromDict(dict, product.category),
        })}
      />
      <ProductDetailPanel
        product={product as Product}
        variants={variants}
        productOptions={productOptions}
        categoryLabel={categoryLabelFromDict(dict, product.category)}
        reviewSummary={summary}
      />

      {isRoverGlassesSlug(product.slug) && (
        <RoverShowcase copy={roverCopy(locale)} ctaHref="#product" className="mt-12 sm:mt-16" />
      )}

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
