"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  applyTheme,
  clearStoredTheme,
  exportThemeCss,
  readStoredTheme,
  saveTheme,
  type StoredTheme,
} from "@/lib/theme/apply";
import {
  buildPalette,
  DEFAULT_THEMES,
  type ThemeColors,
  type ThemeMode,
} from "@/lib/theme/tokens";
import { readableOn } from "@/lib/theme/color";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setBrand: (hex: string) => void;
  setBackground: (hex: string) => void;
  resetMode: () => void;
  copyCss: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [palettes, setPalettes] = useState<Record<ThemeMode, ThemeColors>>(DEFAULT_THEMES);
  const initialized = useRef(false);

  const persist = useCallback(
    (next: { mode: ThemeMode; palettes: Record<ThemeMode, ThemeColors> }) => {
      const stored: StoredTheme = {
        mode: next.mode,
        light: next.palettes.light,
        dark: next.palettes.dark,
      };
      saveTheme(stored);
    },
    [],
  );

  useEffect(() => {
    const stored = readStoredTheme();
    if (stored) {
      const restored = { light: stored.light, dark: stored.dark };
      setPalettes(restored);
      setModeState(stored.mode);
      applyTheme(restored[stored.mode], stored.mode);
    } else {
      applyTheme(DEFAULT_THEMES.dark, "dark");
    }
    initialized.current = true;
  }, []);

  const setMode = useCallback(
    (next: ThemeMode) => {
      setModeState(next);
      setPalettes((current) => {
        applyTheme(current[next], next);
        persist({ mode: next, palettes: current });
        return current;
      });
    },
    [persist],
  );

  const toggleMode = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const setBrand = useCallback(
    (hex: string) => {
      setPalettes((current) => {
        const base = current[mode];
        // oklch surfaces can't go through hex mix() — only swap brand tokens.
        const next: ThemeColors = base.background.includes("oklch")
          ? {
              ...base,
              primary: hex,
              "primary-foreground": readableOn(hex),
            }
          : buildPalette(mode, base.background, hex);
        const updated = { ...current, [mode]: next };
        applyTheme(next, mode);
        persist({ mode, palettes: updated });
        return updated;
      });
    },
    [mode, persist],
  );

  const setBackground = useCallback(
    (hex: string) => {
      setPalettes((current) => {
        const base = current[mode];
        const next = buildPalette(mode, hex, base.primary);
        const updated = { ...current, [mode]: next };
        applyTheme(next, mode);
        persist({ mode, palettes: updated });
        return updated;
      });
    },
    [mode, persist],
  );

  const resetMode = useCallback(() => {
    setPalettes((current) => {
      const updated = { ...current, [mode]: DEFAULT_THEMES[mode] };
      applyTheme(updated[mode], mode);
      persist({ mode, palettes: updated });
      return updated;
    });
    clearStoredTheme();
    toast.success(`Reset ${mode} theme to defaults`);
  }, [mode, persist]);

  const copyCss = useCallback(async () => {
    await navigator.clipboard.writeText(exportThemeCss(palettes.light, palettes.dark));
    toast.success("CSS copied — paste into globals.css");
  }, [palettes]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: palettes[mode],
      setMode,
      toggleMode,
      setBrand,
      setBackground,
      resetMode,
      copyCss,
    }),
    [mode, palettes, setMode, toggleMode, setBrand, setBackground, resetMode, copyCss],
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
