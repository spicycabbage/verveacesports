import type { Locale } from "@/lib/i18n/locale";
import { isLocale } from "@/lib/i18n/locale";

export type LocaleProductCopy = {
  name?: string;
  description?: string;
};

export type ProductTranslations = Partial<Record<Exclude<Locale, "en">, LocaleProductCopy>>;

export function parseProductTranslations(raw: unknown): ProductTranslations {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: ProductTranslations = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isLocale(key) || key === "en") continue;
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const row = value as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim() : "";
    const description = typeof row.description === "string" ? row.description : "";
    if (!name && !description.trim()) continue;
    out[key] = {
      ...(name ? { name } : {}),
      ...(description.trim() ? { description } : {}),
    };
  }
  return out;
}

export function localeProductCopy(
  raw: unknown,
  locale: Locale,
): LocaleProductCopy | undefined {
  if (locale === "en") return undefined;
  return parseProductTranslations(raw)[locale];
}

export function compactProductTranslations(
  translations: ProductTranslations,
): ProductTranslations {
  return parseProductTranslations(translations);
}
