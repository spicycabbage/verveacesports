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
  if (site.id === "bleeq-ca") {
    return site.rangerProducts[0]?.image ?? "/images/home-hero-banner.webp";
  }
  return "/images/home-hero-banner.webp";
}

/** Trim copy to a search-snippet-friendly length without cutting words. */
export function metaDescription(text: string, maxLength = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : maxLength - 1)}…`;
}
