"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  applyTheme,
  clearStoredTheme,
  exportThemeCss,
  getServerThemeSnapshot,
  getStoredThemeSnapshot,
  saveTheme,
  subscribeStoredTheme,
} from "@/lib/theme/apply";
import {
  buildPalette,
  siteDefaultThemes,
  type ThemeColors,
  type ThemeMode,
} from "@/lib/theme/tokens";
import type { SiteId } from "@/lib/site/config";
import { readableOn } from "@/lib/theme/color";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  setBrand: (hex: string) => void;
  setBackground: (hex: string) => void;
  resetMode: () => void;
  copyCss: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// localStorage is the source of truth (see lib/theme/apply.ts). The server and
// hydration renders see `null` → defaults, matching the inline theme-init
// script in app/layout.tsx that already styled the document before paint.
export function ThemeProvider({
  siteId,
  children,
}: {
  siteId: SiteId;
  children: ReactNode;
}) {
  const stored = useSyncExternalStore(
    subscribeStoredTheme,
    getStoredThemeSnapshot,
    getServerThemeSnapshot,
  );

  const lockedLight = siteId === "volt-ca";
  const defaults = useMemo(() => siteDefaultThemes(siteId), [siteId]);
  const mode: ThemeMode = lockedLight ? "light" : "dark";
  const palettes = useMemo<Record<ThemeMode, ThemeColors>>(() => {
    if (lockedLight) return defaults;
    return stored ? { light: stored.light, dark: stored.dark } : defaults;
  }, [defaults, lockedLight, stored]);

  // Sync the document with the current theme (DOM side effect only).
  useEffect(() => {
    applyTheme(lockedLight ? palettes.light : palettes.dark, mode);
  }, [lockedLight, mode, palettes]);

  const persist = useCallback((nextPalettes: Record<ThemeMode, ThemeColors>) => {
    saveTheme({ mode: "dark", light: nextPalettes.light, dark: nextPalettes.dark });
  }, []);

  const setBrand = useCallback(
    (hex: string) => {
      const base = palettes.dark;
      // oklch surfaces can't go through hex mix() — only swap brand tokens.
      const next: ThemeColors = base.background.includes("oklch")
        ? {
            ...base,
            primary: hex,
            "primary-foreground": readableOn(hex),
          }
        : buildPalette("dark", base.background, hex);
      persist({ ...palettes, dark: next });
    },
    [palettes, persist],
  );

  const setBackground = useCallback(
    (hex: string) => {
      const base = palettes.dark;
      persist({ ...palettes, dark: buildPalette("dark", hex, base.primary) });
    },
    [palettes, persist],
  );

  const resetMode = useCallback(() => {
    clearStoredTheme();
    toast.success("Reset theme to defaults");
  }, []);

  const copyCss = useCallback(async () => {
    await navigator.clipboard.writeText(exportThemeCss(palettes.light, palettes.dark));
    toast.success("CSS copied — paste into globals.css");
  }, [palettes]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: lockedLight ? palettes.light : palettes.dark,
      setBrand,
      setBackground,
      resetMode,
      copyCss,
    }),
    [lockedLight, mode, palettes, setBrand, setBackground, resetMode, copyCss],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
