export const COUNTRIES = {
  US: { code: "US", name: "United States", currency: "USD", flag: "🇺🇸" },
  CA: { code: "CA", name: "Canada", currency: "CAD", flag: "🇨🇦" },
} as const;

export type CountryCode = keyof typeof COUNTRIES;
export type Currency = "USD" | "CAD";

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
