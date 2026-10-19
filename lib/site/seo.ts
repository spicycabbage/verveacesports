import { sizedImageUrl } from "@/lib/images/cdn";
import type { SiteConfig } from "./config";

/** Canonical production origin for a storefront (first configured host). */
export function siteBaseUrl(site: SiteConfig): string {
  const host = site.hosts[0] ?? "verveacesports.com";
  return `https://${host}`;
}

/** Absolute canonical URL for a path on the given storefront. */
export function siteAbsoluteUrl(site: SiteConfig, path: string): string {
  return `${siteBaseUrl(site)}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Default social-share image per storefront. */
export function siteOgImage(site: SiteConfig): string {
  switch (site.id) {
    case "bleeq-ca":
      return sizedImageUrl(site.rangerProducts[0]?.image, 1200) || "/images/home-hero-banner.webp";
    case "volt-ca":
      return sizedImageUrl(site.rangerProducts[0]?.image, 1200) || "/catalog/volt/pro-s-01-sq.webp";
    case "verveace":
      return "/images/home-hero-banner.webp";
    default: {
      const _exhaustive: never = site.id;
      return _exhaustive;
    }
  }
}

/** Open Graph locale for the storefront's primary market. */
export function siteOgLocale(site: SiteConfig): "en_CA" | "en_US" {
  switch (site.id) {
    case "bleeq-ca":
    case "volt-ca":
      return "en_CA";
    case "verveace":
      return "en_US";
    default: {
      const _exhaustive: never = site.id;
      return _exhaustive;
    }
  }
}

/** Public logo path used in metadata + Organization JSON-LD. */
export function siteLogoPath(site: SiteConfig): string {
  switch (site.id) {
    case "bleeq-ca":
      return "/bleeq-logo.svg";
    case "volt-ca":
      return "/volt-caddy-logo.png";
    case "verveace":
      return "/verveace_logo.webp";
    default: {
      const _exhaustive: never = site.id;
      return _exhaustive;
    }
  }
}

/** Trim copy to a search-snippet-friendly length without cutting words. */
export function metaDescription(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : maxLength - 1)}…`;
}

/** PDP title — keep Verveace as the product name; mark Bleeq as Canada. */
export function productMetaTitle(site: SiteConfig, name: string): string {
  switch (site.id) {
    case "bleeq-ca":
    case "volt-ca":
      return `${name} — Canada`;
    case "verveace":
      return name;
    default: {
      const _exhaustive: never = site.id;
      return _exhaustive;
    }
  }
}

/** PDP description with market-specific closer so the two domains don't share snippets. */
export function productMetaDescription(
  site: SiteConfig,
  description: string,
  closer: string,
): string {
  const body = description.replace(/\s+/g, " ").trim();
  const room = 160 - closer.length - 1;
  const head = body ? metaDescription(body, Math.max(40, room)) : "";
  return [head, closer].filter(Boolean).join(" ");
}

/** Brand name for Product JSON-LD. */
export function inferProductBrand(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("bleeq")) return "BleeqUp";
  if (n.includes("volt")) return "Volt Caddy";
  if (n.includes("motocaddy")) return "Motocaddy";
  if (n.includes("mgi")) return "MGI";
  if (n.includes("zeiss")) return "ZEISS";
  return "VerveaceSports";
}

/** ISO countries this storefront ships to (FAQ: Verveace US+CA, Bleeq CA only). */
export function shipToCountries(site: SiteConfig): readonly string[] {
  switch (site.id) {
    case "bleeq-ca":
    case "volt-ca":
      return ["CA"];
    case "verveace":
      return ["CA", "US"];
    default: {
      const _exhaustive: never = site.id;
      return _exhaustive;
    }
  }
}

/**
 * FAQ return policy — unused / original packaging, 30 days, refund to original
 * method. Label is "when applicable", so this is ReturnShippingFees, not FreeReturn.
 */
export function merchantReturnPolicyJsonLd(site: SiteConfig) {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: [...shipToCountries(site)],
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 30,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees",
    refundType: "https://schema.org/FullRefund",
    itemCondition: "https://schema.org/NewCondition",
    returnPolicyUrl: siteAbsoluteUrl(site, "/faq"),
  };
}

/**
 * Standard shipping. Rate is $0 CAD only when this item alone already clears
 * `freeShippingOver`; cheaper SKUs link the FAQ instead of inventing a checkout fee.
 */
export function offerShippingDetailsJsonLd(site: SiteConfig, priceCad: number) {
  const faq = siteAbsoluteUrl(site, "/faq");
  const freeOnThisItem = priceCad >= site.freeShippingOver;
  return shipToCountries(site).map((country) => ({
    "@type": "OfferShippingDetails",
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: country,
    },
    shippingSettingsLink: faq,
    ...(freeOnThisItem
      ? {
          shippingRate: {
            "@type": "MonetaryAmount",
            value: 0,
            currency: "CAD",
          },
        }
      : {}),
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 3,
        unitCode: "DAY",
      },
    },
  }));
}

/** BreadcrumbList for a product detail page. */
export function productBreadcrumbJsonLd(opts: {
  site: SiteConfig;
  category: string;
  name: string;
  slug: string;
  homeLabel: string;
  categoryLabel: string;
}) {
  const base = siteBaseUrl(opts.site);
  const productUrl = siteAbsoluteUrl(opts.site, `/products/${opts.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: opts.homeLabel, item: base },
      {
        "@type": "ListItem",
        position: 2,
        name: opts.categoryLabel,
        item: `${base}/products?category=${opts.category}`,
      },
      { "@type": "ListItem", position: 3, name: opts.name, item: productUrl },
    ],
  };
}
