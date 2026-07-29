"use client";

import { SITE_COOKIE, SITES, type SiteId } from "@/lib/site/config";

function readSiteIdFromCookie(): SiteId {
  if (typeof document === "undefined") return "verveace";
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SITE_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  const id = match?.[1];
  if (id === "bleeq-ca" || id === "verveace") return id;
  return "verveace";
}

export function newsletterKeys() {
  const site = SITES[readSiteIdFromCookie()];
  return {
    subscribed: site.newsletterSubscribedKey,
    dismissed: site.newsletterDismissedKey,
  };
}

export function shouldShowNewsletterPopup(): boolean {
  if (typeof window === "undefined") return false;
  const keys = newsletterKeys();
  return !localStorage.getItem(keys.subscribed) && !localStorage.getItem(keys.dismissed);
}

export function markNewsletterSubscribed() {
  const keys = newsletterKeys();
  localStorage.setItem(keys.subscribed, "1");
  localStorage.removeItem(keys.dismissed);
}

export function markNewsletterDismissed() {
  const keys = newsletterKeys();
  localStorage.setItem(keys.dismissed, "1");
}

/** @deprecated use newsletterKeys() — kept for any static imports */
export const NEWSLETTER_SUBSCRIBED_KEY = "verveacesports_newsletter_subscribed_v1";
export const NEWSLETTER_DISMISSED_KEY = "verveacesports_newsletter_dismissed_v1";
