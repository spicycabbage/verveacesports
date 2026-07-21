"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/lib/store/locale";
import type { Locale } from "@/lib/i18n/locale";

/** Sync client store with locale from the server cookie. */
export function LocaleHydrator({ locale }: { locale: Locale }) {
  const setLocale = useLocaleStore((s) => s.setLocale);

  useEffect(() => {
    setLocale(locale);
  }, [locale, setLocale]);

  return null;
}
