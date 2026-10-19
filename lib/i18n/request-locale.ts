import { parseLocaleCookie, type Locale } from "@/lib/i18n/locale";
import { blogLocaleFromPath } from "@/lib/content/blog/paths";
import { getRequestPathname } from "@/lib/request/pathname";

/**
 * Blog language URLs win over the locale cookie so a French article stays
 * French for Googlebot (which doesn't send the cookie) and for html lang.
 */
export async function resolveRequestLocale(cookieValue: string | null | undefined): Promise<Locale> {
  const fromPath = blogLocaleFromPath(await getRequestPathname());
  if (fromPath) return fromPath;
  return parseLocaleCookie(cookieValue);
}
