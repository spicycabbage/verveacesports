"use client";

import { create } from "zustand";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale) => set({ locale }),
}));
