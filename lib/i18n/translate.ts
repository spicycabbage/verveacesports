import type { Dictionary } from "@/lib/i18n/messages/types";
import { en } from "@/lib/i18n/messages/en";

// Client-safe translation helpers. Deliberately imports ONLY the English
// dictionary (for fallback) — never import `dictionary.ts` from a Client
// Component, or every locale ships in the browser bundle.

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
