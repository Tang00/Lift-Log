"use client";

import { useEffect, useState } from "react";
import {
  getPaletteForMode,
  THEME_OPTIONS,
  type ThemeMode,
} from "@/utils/theme/theme-palettes";

const STORAGE_KEY = "lift-log-theme";

function isThemeMode(value: string | null): value is ThemeMode {
  return THEME_OPTIONS.some((theme) => theme.mode === value);
}

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (isThemeMode(storedTheme)) {
      setThemeMode(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme() {
      const palette = getPaletteForMode(themeMode);
      root.style.setProperty("--bg", palette.bg);
      root.style.setProperty("--surface", palette.surface);
      root.style.setProperty("--text", palette.text);
      root.style.setProperty("--muted", palette.muted);
      root.style.setProperty("--brand", palette.brand);
      root.style.setProperty("--success", palette.success);
      root.style.setProperty("--danger", palette.danger);
      root.style.setProperty("--backdrop", palette.backdrop);
      root.style.colorScheme = palette.colorScheme;
    }

    applyTheme();

    if (themeMode === "system") {
      window.localStorage.removeItem(STORAGE_KEY);
      mediaQuery.addEventListener("change", applyTheme);
      return () => {
        mediaQuery.removeEventListener("change", applyTheme);
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
