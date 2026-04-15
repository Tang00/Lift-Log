"use client";

import { useEffect, useState } from "react";
import {
  getSystemThemeMode,
  getPaletteForMode,
  THEME_OPTIONS,
  type ThemeMode,
} from "@/utils/theme/theme-palettes";

const STORAGE_KEY = "lift-log-theme";
const THEME_KEYS = [
  "--bg",
  "--surface",
  "--text",
  "--muted",
  "--brand",
  "--success",
  "--danger",
  "--backdrop",
] as const;

function isThemeMode(value: string | null): value is ThemeMode {
  return THEME_OPTIONS.some((theme) => theme.mode === value);
}

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    return isThemeMode(storedTheme) ? storedTheme : "system";
  });

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme(nextMode: ThemeMode) {
      const resolvedMode = nextMode === "system" ? getSystemThemeMode() : nextMode;
      const palette = getPaletteForMode(resolvedMode);

      for (const key of THEME_KEYS) {
        root.style.removeProperty(key);
      }

      root.style.setProperty("--bg", palette.bg);
      root.style.setProperty("--surface", palette.surface);
      root.style.setProperty("--text", palette.text);
      root.style.setProperty("--muted", palette.muted);
      root.style.setProperty("--brand", palette.brand);
      root.style.setProperty("--success", palette.success);
      root.style.setProperty("--danger", palette.danger);
      root.style.setProperty("--backdrop", palette.backdrop);
      root.style.colorScheme = palette.colorScheme;
      root.dataset.themeMode = nextMode;
      root.dataset.resolvedThemeMode = resolvedMode;
    }

    applyTheme(themeMode);

    if (themeMode === "system") {
      window.localStorage.removeItem(STORAGE_KEY);
      const handleMediaChange = () => applyTheme("system");
      mediaQuery.addEventListener("change", handleMediaChange);
      return () => {
        mediaQuery.removeEventListener("change", handleMediaChange);
      };
    }

    window.localStorage.setItem(STORAGE_KEY, themeMode);
    return undefined;
  }, [themeMode]);

  return {
    setThemeMode,
    themeMode,
  };
}
