export const LOCALE_COOKIE = "verveacesports_locale";

export const LOCALES = {
  en: { code: "en", label: "English", htmlLang: "en" },
  nl: { code: "nl", label: "Nederlands", htmlLang: "nl" },
  fr: { code: "fr", label: "Français", htmlLang: "fr" },
  de: { code: "de", label: "Deutsch", htmlLang: "de" },
  "pt-PT": { code: "pt-PT", label: "Português (portugal)", htmlLang: "pt" },
  es: { code: "es", label: "Español", htmlLang: "es" },
  it: { code: "it", label: "Italiano", htmlLang: "it" },
  ja: { code: "ja", label: "日本語", htmlLang: "ja" },
  "zh-CN": { code: "zh-CN", label: "简体中文", htmlLang: "zh-Hans" },
} as const;

export type Locale = keyof typeof LOCALES;

export const LOCALE_LIST = Object.values(LOCALES);

export const DEFAULT_LOCALE: Locale = "en";

const LOCALE_SET = new Set<string>(Object.keys(LOCALES));

export function isLocale(value: string): value is Locale {
  return LOCALE_SET.has(value);
}

export function parseLocaleCookie(value: string | null | undefined): Locale {
  if (value && isLocale(value)) return value;
  return DEFAULT_LOCALE;
}

export function localeLabel(locale: Locale): string {
  return LOCALES[locale].label;
}

export function localeHtmlLang(locale: Locale): string {
  return LOCALES[locale].htmlLang;
}
