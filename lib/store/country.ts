"use client";

import { create } from "zustand";
import type { CountryCode, Currency } from "@/lib/constants";
import { COUNTRIES } from "@/lib/constants";

type CountryState = {
  country: CountryCode;
  currency: Currency;
  setCountry: (country: CountryCode) => void;
};

/** Market is set from geo (server cookie) — not persisted client-side. */
export const useCountryStore = create<CountryState>()((set) => ({
  country: "US",
  currency: "USD",
  setCountry: (country) =>
    set({ country, currency: COUNTRIES[country].currency }),
}));
