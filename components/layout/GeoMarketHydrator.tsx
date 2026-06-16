"use client";

import { useEffect } from "react";
import { useCountryStore } from "@/lib/store/country";
import type { CountryCode } from "@/lib/constants";

/** Sync client store with geo-detected market from the server cookie. */
export function GeoMarketHydrator({ market }: { market: CountryCode }) {
  const setCountry = useCountryStore((s) => s.setCountry);

  useEffect(() => {
    setCountry(market);
  }, [market, setCountry]);

  return null;
}
