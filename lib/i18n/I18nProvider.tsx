"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/messages/types";
import { createT, type TranslateFn } from "@/lib/i18n/dictionary";

type I18nContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nContextValue>(
    () => ({ locale, dictionary, t: createT(dictionary) }),
    [locale, dictionary],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

export function useDictionary(): Dictionary {
  return useI18n().dictionary;
}

export function useT(): TranslateFn {
  return useI18n().t;
}

export function useLocale(): Locale {
  return useI18n().locale;
}
