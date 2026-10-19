import type { SiteConfig } from "@/lib/site/config";
import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { catalogNavLabel } from "@/lib/i18n/catalog-copy";
import { getWarrantyPolicyForLocale } from "@/lib/i18n/warranty-copy";

export type WarrantySection = {
  title: string;
  body: string[];
  bullets?: string[];
};

export type WarrantyPolicy = {
  updated: string;
  intro: string;
  sections: WarrantySection[];
  entityNote?: string;
};

export { getWarrantyPolicyForLocale };

/** Covered hardware SKUs offered for warranty registration (lenses excluded). */
export function warrantyProductOptions(
  site: SiteConfig,
  locale: Locale = DEFAULT_LOCALE,
  otherGolf = "Other (MGI / Motocaddy / golf gear)",
): { value: string; label: string }[] {
  const covered = [
    ...site.rangerProducts.map((p) => ({
      value: p.slug,
      label: catalogNavLabel(p.slug, locale, p.label),
    })),
    ...site.accessoryProducts
      .filter((p) =>
        ["bleequp-power-plus", "bleequp-bluetooth-controller"].includes(p.slug),
      )
      .map((p) => ({
        value: p.slug,
        label: catalogNavLabel(p.slug, locale, p.label),
      })),
  ];

  if (site.id === "volt-ca") {
    return [...site.rangerProducts, ...site.accessoryProducts].map((p) => ({
      value: p.slug,
      label: catalogNavLabel(p.slug, locale, p.label),
    }));
  }

  if (site.id === "verveace") {
    covered.push({
      value: "other-mgi-motocaddy",
      label: otherGolf,
    });
  }

  return covered;
}

export function getWarrantyPolicy(site: SiteConfig, locale: Locale): WarrantyPolicy {
  return getWarrantyPolicyForLocale(site, locale);
}
