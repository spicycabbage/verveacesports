export const COUNTRIES = {
  US: { code: "US", name: "United States", currency: "USD", flag: "🇺🇸" },
  CA: { code: "CA", name: "Canada", currency: "CAD", flag: "🇨🇦" },
} as const;

export type CountryCode = keyof typeof COUNTRIES;
export type Currency = "USD" | "CAD";

/** Canadian provinces / territories (ISO 3166-2 codes) for tax + shipping address. */
export const CA_REGIONS = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
] as const;

/** US states + DC for shipping address (sales tax still country-default until seeded). */
export const US_REGIONS = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
] as const;

const CA_REGION_BY_CODE = new Map<string, string>(CA_REGIONS.map((r) => [r.code, r.code]));
const CA_REGION_BY_NAME = new Map<string, string>(
  CA_REGIONS.map((r) => [r.name.toUpperCase(), r.code]),
);
const US_REGION_BY_CODE = new Map<string, string>(US_REGIONS.map((r) => [r.code, r.code]));
const US_REGION_BY_NAME = new Map<string, string>(
  US_REGIONS.map((r) => [r.name.toUpperCase(), r.code]),
);

/** Normalize free-text / select state-province to a tax lookup code. */
export function normalizeTaxRegion(
  country: string,
  region: string | null | undefined,
): string | null {
  const raw = region?.trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (country === "CA") {
    return CA_REGION_BY_CODE.get(upper) ?? CA_REGION_BY_NAME.get(upper) ?? null;
  }
  if (country === "US") {
    return US_REGION_BY_CODE.get(upper) ?? US_REGION_BY_NAME.get(upper) ?? null;
  }
  return upper;
}

export function regionsForCountry(country: CountryCode) {
  return country === "CA" ? CA_REGIONS : US_REGIONS;
}

export const CATEGORIES = [
  "ai-glasses",
  "wearables",
  "electric-carts",
  "golf-gear",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  "ai-glasses": "AI Glasses",
  wearables: "Wearables",
  "electric-carts": "Electric Carts",
  "golf-gear": "Golf Gear",
};

export function countryName(code: string | null | undefined): string {
  if (code === "US" || code === "CA") return COUNTRIES[code].name;
  return code ?? "";
}

export function categoryLabel(category: string): string {
  if ((CATEGORIES as readonly string[]).includes(category)) {
    return CATEGORY_LABELS[category as Category];
  }
  return category;
}

export const LOYALTY = {
  POINTS_PER_DOLLAR: 1,
  POINTS_PER_DOLLAR_REDEEM: 100,
  REFERRAL_BONUS_POINTS: 100,
} as const;

export const REFERRAL_COOKIE = "verveacesports_ref";
export const REFERRAL_COOKIE_DAYS = 30;

/** Full document navigation required so Set-Cookie on the redirect is applied. */
export const SIGN_OUT_PATH = "/api/auth/sign-out";
