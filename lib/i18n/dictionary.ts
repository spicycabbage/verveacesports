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

/** Replace `{var}` tokens in a template with provided values. */
export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined || value === null ? match : String(value);
  });
}

/** Deep-get a value from an object by dotted path (e.g. "nav.signIn"). */
function deepGet(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export type TranslateFn = (path: string, vars?: Record<string, string | number>) => string;

/**
 * Build a translator bound to `dict`. Resolves a dotted `path` to a string,
 * interpolates `{var}` tokens, and defensively falls back to English (then the
 * raw path) when a key is missing in the active locale.
 */
export function createT(dict: Dictionary): TranslateFn {
  return (path, vars) => {
    const raw = deepGet(dict, path);
    if (typeof raw === "string") return interpolate(raw, vars);

    const fallback = deepGet(en, path);
    if (typeof fallback === "string") return interpolate(fallback, vars);

    return path;
  };
}
