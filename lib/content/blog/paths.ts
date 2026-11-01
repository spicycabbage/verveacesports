import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/locale";
import type { SiteConfig } from "@/lib/site/config";
import { siteAbsoluteUrl } from "@/lib/site/seo";

/** Locales that get a URL prefix. English stays at /blog so existing URLs don't move. */
export const BLOG_PREFIX_LOCALES = ["nl", "fr", "de", "pt-PT", "es", "it", "ja", "zh-CN"] as const;

export type BlogPrefixLocale = (typeof BLOG_PREFIX_LOCALES)[number];

const PREFIXES = new Set<string>(BLOG_PREFIX_LOCALES);

export function isBlogPrefixLocale(value: string): value is BlogPrefixLocale {
  return PREFIXES.has(value);
}

/** hreflang + inLanguage. English is en-CA because this storefront sells in Canada. */
export function blogHrefLang(locale: Locale): string {
  switch (locale) {
    case "en":
      return "en-CA";
    case "nl":
      return "nl";
    case "fr":
      return "fr-CA";
    case "de":
      return "de";
    case "pt-PT":
      return "pt-PT";
    case "es":
      return "es";
    case "it":
      return "it";
    case "ja":
      return "ja";
    case "zh-CN":
      return "zh-Hans";
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}

/** Open Graph locale (underscore form). */
export function blogOgLocale(locale: Locale): string {
  switch (locale) {
    case "en":
      return "en_CA";
    case "nl":
      return "nl_NL";
    case "fr":
      return "fr_CA";
    case "de":
      return "de_DE";
    case "pt-PT":
      return "pt_PT";
    case "es":
      return "es_ES";
    case "it":
      return "it_IT";
    case "ja":
      return "ja_JP";
    case "zh-CN":
      return "zh_CN";
    default: {
      const _exhaustive: never = locale;
      return _exhaustive;
    }
  }
}

/** `suffix` is the path after `/blog`, e.g. "" | "/my-slug" | "/authors/kim-chen" | "/rss.xml". */
export function blogPath(locale: Locale, suffix = ""): string {
  const tail = suffix.startsWith("/") || suffix === "" ? suffix : `/${suffix}`;
  if (locale === DEFAULT_LOCALE) return `/blog${tail}`;
  return `/${locale}/blog${tail}`;
}

export function blogPostPath(locale: Locale, slug: string): string {
  return blogPath(locale, `/${slug}`);
}

export function blogAuthorPath(locale: Locale, authorSlug: string): string {
  return blogPath(locale, `/authors/${authorSlug}`);
}

/**
 * Absolute hreflang map for one blog resource, including x-default → English.
 * Only include locales that actually have a translation (plus English).
 */
export function blogHreflangLanguages(
  site: SiteConfig,
  suffix: string,
  locales: readonly Locale[],
): Record<string, string> {
  const languages: Record<string, string> = {
    "x-default": siteAbsoluteUrl(site, blogPath(DEFAULT_LOCALE, suffix)),
  };
  for (const locale of locales) {
    languages[blogHrefLang(locale)] = siteAbsoluteUrl(site, blogPath(locale, suffix));
  }
  return languages;
}

const BLOG_PATH_RE = /^\/(nl|fr|de|pt-PT|es|it|ja|zh-CN)(\/blog(?:\/.*)?)$/;

/** Locale implied by a blog URL, or null when the path isn't a localized blog URL. */
export function blogLocaleFromPath(pathname: string): Locale | null {
  const match = BLOG_PATH_RE.exec(pathname);
  if (!match) return null;
  return isLocale(match[1]) ? match[1] : null;
}

/** Same blog resource in another language. Null when `pathname` isn't a blog URL. */
export function blogPathForLocale(pathname: string, next: Locale): string | null {
  // Category hubs are English-only: other languages land on their blog index.
  if (pathname.startsWith("/blog/category/")) return blogPath(next);
  const prefixed = BLOG_PATH_RE.exec(pathname);
  if (prefixed) {
    const rest = prefixed[2];
    return next === DEFAULT_LOCALE ? rest : `/${next}${rest}`;
  }
  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    return blogPath(next, pathname.slice("/blog".length));
  }
  return null;
}
