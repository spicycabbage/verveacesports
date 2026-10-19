import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import type { CatalogCopy, CatalogMap } from "@/lib/i18n/catalog/types";
import { catalogEn } from "@/lib/i18n/catalog/en";
import { catalogNl } from "@/lib/i18n/catalog/nl";
import { catalogFr } from "@/lib/i18n/catalog/fr";
import { catalogDe } from "@/lib/i18n/catalog/de";
import { catalogPtPT } from "@/lib/i18n/catalog/pt-PT";
import { catalogEs } from "@/lib/i18n/catalog/es";
import { catalogIt } from "@/lib/i18n/catalog/it";
import { catalogJa } from "@/lib/i18n/catalog/ja";
import { catalogZhCN } from "@/lib/i18n/catalog/zh-CN";
import { OPTION_LABELS } from "@/lib/i18n/option-labels";
import { localeProductCopy } from "@/lib/i18n/product-translations";

const CATALOGS: Record<Locale, CatalogMap> = {
  en: catalogEn,
  nl: catalogNl,
  fr: catalogFr,
  de: catalogDe,
  "pt-PT": catalogPtPT,
  es: catalogEs,
  it: catalogIt,
  ja: catalogJa,
  "zh-CN": catalogZhCN,
};

export function getCatalogCopy(slug: string, locale: Locale): CatalogCopy | undefined {
  return CATALOGS[locale]?.[slug] ?? CATALOGS[DEFAULT_LOCALE]?.[slug];
}

export function catalogProductName(
  slug: string,
  locale: Locale,
  fallback: string,
  translations?: unknown,
): string {
  return (
    localeProductCopy(translations, locale)?.name ||
    getCatalogCopy(slug, locale)?.name ||
    fallback
  );
}

/**
 * English is the admin-edited `products.description` row; the bundled English
 * file is only a seed fallback. Other locales keep their translation first.
 */
export function catalogProductDescription(
  slug: string,
  locale: Locale,
  fallback: string,
  translations?: unknown,
): string {
  const seed = CATALOGS[DEFAULT_LOCALE][slug]?.description;
  return (
    localeProductCopy(translations, locale)?.description ||
    (locale === DEFAULT_LOCALE
      ? fallback || seed
      : CATALOGS[locale]?.[slug]?.description || fallback || seed) ||
    ""
  );
}

export function catalogNavLabel(
  slug: string,
  locale: Locale,
  fallback: string,
  translations?: unknown,
): string {
  const copy = getCatalogCopy(slug, locale);
  return (
    copy?.navLabel ??
    localeProductCopy(translations, locale)?.name ??
    copy?.name ??
    fallback
  );
}

export function catalogShortLabel(
  slug: string,
  locale: Locale,
  fallback: string,
  translations?: unknown,
): string {
  const copy = getCatalogCopy(slug, locale);
  return (
    copy?.shortLabel ??
    copy?.navLabel ??
    localeProductCopy(translations, locale)?.name ??
    copy?.name ??
    fallback
  );
}

export function localizeProduct<
  T extends {
    slug: string;
    name: string;
    description?: string | null;
    translations?: unknown;
  },
>(product: T, locale: Locale): T {
  const db = localeProductCopy(product.translations, locale);
  const file = getCatalogCopy(product.slug, locale);
  const name = db?.name || file?.name;
  return {
    ...product,
    name: name || product.name,
    description: catalogProductDescription(
      product.slug,
      locale,
      product.description ?? "",
      product.translations,
    ),
  };
}

export function localizeProducts<
  T extends {
    slug: string;
    name: string;
    description?: string | null;
    translations?: unknown;
  },
>(products: T[], locale: Locale): T[] {
  return products.map((product) => localizeProduct(product, locale));
}

export function localizeOptionLabel(value: string, locale: Locale): string {
  if (locale === "en") return value;
  return OPTION_LABELS[locale][value] ?? value;
}
