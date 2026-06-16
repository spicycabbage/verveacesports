import type { NextRequest } from "next/server";
import type { CountryCode } from "@/lib/constants";

export const MARKET_COOKIE = "verveacesports_market";

/** Canada → CAD market; everywhere else → USD. */
export function marketFromGeoCountry(geoCountry: string | null | undefined): CountryCode {
  return geoCountry?.toUpperCase() === "CA" ? "CA" : "US";
}

export function detectMarketFromRequest(request: NextRequest): CountryCode {
  const override = process.env.GEO_COUNTRY_OVERRIDE?.toUpperCase();
  if (override === "CA" || override === "US") return override;

  const geo =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    null;
  return marketFromGeoCountry(geo);
}

export function parseMarketCookie(value: string | null | undefined): CountryCode {
  return value === "CA" ? "CA" : "US";
}
