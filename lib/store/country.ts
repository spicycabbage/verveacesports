"use client";

import { create } from "zustand";
import type { CountryCode, Currency } from "@/lib/constants";
import { COUNTRIES } from "@/lib/constants";

type CountryState = {
  country: CountryCode;
  currency: Currency;
  setCountry: (country: CountryCode) => void;
};

/** Market is set from geo (server cookie) — prices are CAD-only. */
export const useCountryStore = create<CountryState>()((set) => ({
  country: "CA",
  currency: "CAD",
  setCountry: (country) => set({ country, currency: "CAD" }),
}));
