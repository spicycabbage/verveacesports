"use client";

import { isSiteId, SITE_COOKIE, SITES, type SiteId } from "@/lib/site/config";

function readSiteIdFromCookie(): SiteId {
  if (typeof document === "undefined") return "verveace";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SITE_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  const id = match?.[1];
  if (isSiteId(id)) return id;
  return "verveace";
}

export function newsletterKeys(siteId?: SiteId) {
  const site = SITES[siteId ?? readSiteIdFromCookie()];
  return {
    subscribed: site.newsletterSubscribedKey,
    dismissed: site.newsletterDismissedKey,
  };
}

export function shouldShowNewsletterPopup(siteId?: SiteId): boolean {
  if (typeof window === "undefined") return false;
  const keys = newsletterKeys(siteId);
  return !localStorage.getItem(keys.subscribed) && !localStorage.getItem(keys.dismissed);
}

export function markNewsletterSubscribed(siteId?: SiteId) {
  const keys = newsletterKeys(siteId);
  localStorage.setItem(keys.subscribed, "1");
  localStorage.removeItem(keys.dismissed);
}

export function markNewsletterDismissed(siteId?: SiteId) {
  const keys = newsletterKeys(siteId);
  localStorage.setItem(keys.dismissed, "1");
}

/** @deprecated use newsletterKeys() — kept for any static imports */
export const NEWSLETTER_SUBSCRIBED_KEY = SITES.verveace.newsletterSubscribedKey;
export const NEWSLETTER_DISMISSED_KEY = SITES.verveace.newsletterDismissedKey;
