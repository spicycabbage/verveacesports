"use client";

import dynamic from "next/dynamic";

// The popup (Dialog, form, hero image) opens ≥2.5s after load, if at all —
// no reason for it to be in the initial bundle of every storefront page.
const NewsletterPopup = dynamic(
  () => import("@/components/newsletter/NewsletterPopup").then((m) => m.NewsletterPopup),
  { ssr: false },
);

export function NewsletterPopupLazy() {
  return <NewsletterPopup />;
}
