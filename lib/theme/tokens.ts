import { mix, readableOn } from "./color";

export type ThemeMode = "light" | "dark";

export type ThemeTokenKey =
  | "background"
  | "foreground"
  | "primary"
  | "primary-foreground"
  | "card"
  | "card-foreground"
  | "muted"
  | "muted-foreground"
  | "secondary"
  | "accent"
  | "border";

export type ThemeColors = Record<ThemeTokenKey, string>;

export const THEME_STORAGE_KEY = "verveacesports_theme_v8";
export const LEGACY_THEME_STORAGE_KEYS = [
  "verveacesports_theme_v7",
  "verveacesports_theme_v6",
  "verveacesports_theme_v5",
  "verveacesports_theme_v4",
  "verveacesports_theme_v3",
  "verveacesports_theme_v2",
  "verveacesports_theme_v1",
] as const;

export const THEME_TOKEN_KEYS: ThemeTokenKey[] = [
  "background",
  "foreground",
  "primary",
  "primary-foreground",
  "card",
  "card-foreground",
  "muted",
  "muted-foreground",
  "secondary",
  "accent",
  "border",
];

// Builds a full, balanced palette from just a mode + base background + brand color.
// This is what lets the editor stay swatch-only (no hex knowledge required).
export function buildPalette(
  mode: ThemeMode,
  background: string,
  brand: string,
): ThemeColors {
  if (mode === "dark") {
    return {
      background,
      foreground: "#fafafa",
      primary: brand,
      "primary-foreground": readableOn(brand),
      card: mix(background, "#ffffff", 0.07),
      "card-foreground": "#fafafa",
      muted: mix(background, "#ffffff", 0.11),
      "muted-foreground": "#a1a1aa",
      secondary: mix(background, "#ffffff", 0.14),
      accent: mix(brand, background, 0.8),
      border: "#ffffff1f",
    };
  }
  return {
    background,
    foreground: "#171717",
    primary: brand,
    "primary-foreground": readableOn(brand),
    card: mix(background, "#000000", 0.03),
    "card-foreground": "#171717",
    muted: mix(background, "#000000", 0.05),
    "muted-foreground": "#6b7280",
    secondary: mix(background, "#000000", 0.08),
    accent: mix(brand, background, 0.86),
    border: "#0000001a",
  };
}

export const DEFAULT_BRAND = "#f97316";

/**
 * Visible dark-blue surface (not near-black).
 * ~5% darker than #1a4068 for a bit more depth while keeping the logo readable.
 */
export const DARK_SURFACE = "#193d63";
/** Soft light gray — less harsh than pure white. */
export const LIGHT_SURFACE = "#f4f4f5";

export const DARK_THEME: ThemeColors = buildPalette("dark", DARK_SURFACE, DEFAULT_BRAND);
export const LIGHT_THEME: ThemeColors = buildPalette("light", LIGHT_SURFACE, "#ea580c");

export const DEFAULT_THEMES: Record<ThemeMode, ThemeColors> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

// Backwards-compatible default used by SSR fallbacks.
export const DEFAULT_THEME = DARK_THEME;

export type BrandSwatch = { name: string; value: string };

export const BRAND_SWATCHES: BrandSwatch[] = [
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#a855f7" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Green", value: "#22c55e" },
  { name: "Lime", value: "#84cc16" },
  { name: "Slate", value: "#64748b" },
];

export type SurfaceSwatch = { name: string; value: string };

// Curated background tones per mode. The rest of the palette is derived from these.
export const SURFACE_SWATCHES: Record<ThemeMode, SurfaceSwatch[]> = {
  dark: [
    { name: "Blue", value: DARK_SURFACE },
    { name: "Navy", value: "#0c1322" },
    { name: "Slate", value: "#0f172a" },
    { name: "Ink", value: "#0d0d0f" },
    { name: "Black", value: "#000000" },
    { name: "Ocean", value: "#172554" },
  ],
  light: [
    { name: "Gray", value: LIGHT_SURFACE },
    { name: "Snow", value: "#f8fafc" },
    { name: "White", value: "#ffffff" },
    { name: "Cream", value: "#faf8f5" },
    { name: "Sand", value: "#f6f4ef" },
    { name: "Rose", value: "#fff1f2" },
  ],
};
