"use client";

import type { Locale } from "@/lib/i18n/locale";

/** Writes the locale cookie the rest of the storefront reads. */
export async function persistLocale(locale: Locale): Promise<boolean> {
  const res = await fetch("/api/locale", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale }),
  });
  return res.ok;
}
