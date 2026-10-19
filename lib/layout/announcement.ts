/** Turn the sitewide promo bar on or off. fondo2026 expired Sept 25, 2026. */
export const ANNOUNCEMENT_ENABLED = false;
export const ANNOUNCEMENT_CODE = "fondo2026";

export function announcementCookieName(storagePrefix: string): string {
  return `${storagePrefix}_announce`;
}

export function announcementCookieMatches(
  cookieValue: string | undefined,
  campaignId = ANNOUNCEMENT_CODE,
): boolean {
  return cookieValue === campaignId;
}
