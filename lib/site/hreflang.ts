import type { SiteConfig } from "./config";

export type HreflangLink = {
  hreflang: string;
  href: string;
};

/**
 * Generate hreflang alternate links for multi-locale storefronts.
 * BleeqUp Canada (ca.bleequp.com) links to known BleeqUp locales.
 * VerveaceSports does not claim to be part of the BleeqUp locale network.
 */
export function generateHreflangLinks(
  site: SiteConfig,
  pathname: string = "/",
): HreflangLink[] {
  // Only BleeqUp Canada participates in the BleeqUp international locale network
  if (site.id !== "bleeq-ca") {
    return [];
  }

  const path = pathname === "/" ? "" : pathname;

  // Known BleeqUp locales as of 2026-09
  return [
    { hreflang: "x-default", href: `https://www.bleequp.com${path}` },
    { hreflang: "en", href: `https://www.bleequp.com${path}` },
    { hreflang: "en-CA", href: `https://ca.bleequp.com${path}` },
    { hreflang: "en-AU", href: `https://au.bleequp.com${path}` },
    { hreflang: "en-GB", href: `https://uk.bleequp.com${path}` },
    { hreflang: "fr-FR", href: `https://fr.bleequp.com${path}` },
    { hreflang: "ja-JP", href: `https://jp.bleequp.com${path}` },
  ];
}
