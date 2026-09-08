import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/messages/types";
import { en } from "@/lib/i18n/messages/en";
import { nl } from "@/lib/i18n/messages/nl";
import { fr } from "@/lib/i18n/messages/fr";
import { de } from "@/lib/i18n/messages/de";
import { ptPT } from "@/lib/i18n/messages/pt-PT";
import { es } from "@/lib/i18n/messages/es";
import { it } from "@/lib/i18n/messages/it";
import { ja } from "@/lib/i18n/messages/ja";
import { zhCN } from "@/lib/i18n/messages/zh-CN";

export type { Dictionary } from "@/lib/i18n/messages/types";
// Server-only module (imports every locale). Client code must import from
// `@/lib/i18n/translate` instead.
export { createT, interpolate, type TranslateFn } from "@/lib/i18n/translate";

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  nl,
  fr,
  de,
  "pt-PT": ptPT,
  es,
  it,
  ja,
  "zh-CN": zhCN,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}
