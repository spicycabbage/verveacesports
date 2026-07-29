import {
  DEFAULT_THEMES,
  LEGACY_THEME_STORAGE_KEYS,
  THEME_STORAGE_KEY,
  THEME_TOKEN_KEYS,
  type ThemeColors,
  type ThemeMode,
} from "./tokens";
import { SITE_COOKIE, SITES, type SiteId } from "@/lib/site/config";

function themeStorageKey(): string {
  if (typeof document === "undefined") return THEME_STORAGE_KEY;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${SITE_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  const id = match?.[1] as SiteId | undefined;
  if (id === "bleeq-ca" || id === "verveace") return SITES[id].themeStorageKey;
  return THEME_STORAGE_KEY;
}

export type StoredTheme = {
  mode: ThemeMode;
  light: ThemeColors;
  dark: ThemeColors;
};

function setVar(root: HTMLElement, key: string, value: string) {
  root.style.setProperty(`--${key}`, value);
}

export function applyTheme(colors: ThemeColors, mode: ThemeMode) {
  const root = document.documentElement;

  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;

  for (const key of THEME_TOKEN_KEYS) {
    setVar(root, key, colors[key]);
    setVar(root, `color-${key}`, colors[key]);
  }

  // Derived tokens used across shadcn components.
  const derived: Record<string, string> = {
    ring: colors.primary,
    input: `${colors.foreground}24`,
    popover: colors.card,
    "popover-foreground": colors["card-foreground"],
    sidebar: colors.card,
    "sidebar-foreground": colors["card-foreground"],
    "sidebar-primary": colors.primary,
    "sidebar-primary-foreground": colors["primary-foreground"],
    "sidebar-accent": colors.accent,
    "sidebar-accent-foreground": colors.foreground,
    "sidebar-border": colors.border,
    "sidebar-ring": colors.primary,
    "accent-foreground": colors.foreground,
    "secondary-foreground": colors.foreground,
    destructive: "#ef4444",
    "chart-1": colors.primary,
    "chart-2": colors.secondary,
    "chart-3": colors.accent,
    "chart-4": colors.muted,
    "chart-5": colors.foreground,
  };

  for (const [key, value] of Object.entries(derived)) {
    setVar(root, key, value);
    setVar(root, `color-${key}`, value);
  }
}

function parseStoredTheme(raw: string): StoredTheme | null {
  try {
    const parsed = JSON.parse(raw) as Partial<StoredTheme>;
    const mode: ThemeMode = parsed.mode === "light" ? "light" : "dark";
    return {
      mode,
      light: { ...DEFAULT_THEMES.light, ...parsed.light },
      dark: { ...DEFAULT_THEMES.dark, ...parsed.dark },
    };
  } catch {
    return null;
  }
}

/** Bad light backgrounds from earlier theme experiments. */
const RESET_LIGHT_BACKGROUNDS = new Set(["#ffffff", "#fff1f2"]);

function repairSurfaces(theme: StoredTheme): StoredTheme {
  let light = theme.light;
  if (RESET_LIGHT_BACKGROUNDS.has(String(theme.light.background).toLowerCase())) {
    light = DEFAULT_THEMES.light;
  }

  // Always re-apply visible dark-blue surfaces. Near-black / tiny-chroma oklch
  // values read as pure black; keep only a customized brand color.
  const dark: ThemeColors = {
    ...DEFAULT_THEMES.dark,
    primary: theme.dark.primary || DEFAULT_THEMES.dark.primary,
    "primary-foreground":
      theme.dark["primary-foreground"] || DEFAULT_THEMES.dark["primary-foreground"],
  };

  return { ...theme, light, dark };
}

export function readStoredTheme(): StoredTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const current = localStorage.getItem(themeStorageKey());
    if (current) {
      const parsed = parseStoredTheme(current);
      if (!parsed) return null;
      const repaired = repairSurfaces(parsed);
      saveTheme(repaired);
      return repaired;
    }

    // Recover mode + light prefs from older keys; dark always relaunches as oklch blue.
    for (const key of LEGACY_THEME_STORAGE_KEYS) {
      const legacy = localStorage.getItem(key);
      if (!legacy) continue;
      const parsed = parseStoredTheme(legacy);
      if (!parsed) continue;
      const repaired = repairSurfaces(parsed);
      saveTheme(repaired);
      return repaired;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveTheme(theme: StoredTheme) {
  localStorage.setItem(themeStorageKey(), JSON.stringify(theme));
}

export function clearStoredTheme() {
  localStorage.removeItem(themeStorageKey());
  for (const key of LEGACY_THEME_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}

export function exportThemeCss(light: ThemeColors, dark: ThemeColors): string {
  const block = (colors: ThemeColors) => {
    const lines = THEME_TOKEN_KEYS.map((key) => `  --${key}: ${colors[key]};`);
    lines.push(`  --ring: ${colors.primary};`);
    lines.push(`  --input: ${colors.foreground}24;`);
    lines.push(`  --popover: ${colors.card};`);
    lines.push(`  --popover-foreground: ${colors["card-foreground"]};`);
    return lines.join("\n");
  };
  return `:root {\n${block(light)}\n}\n\n.dark {\n${block(dark)}\n}`;
}

export function toColorInputValue(value: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{8}$/.test(value)) return value.slice(0, 7);
  return "#000000";
}
