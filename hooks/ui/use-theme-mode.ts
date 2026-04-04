"use client";

import { useEffect, useState } from "react";

export type ThemeMode =
  | "system"
  | "light"
  | "dark"
  | "sage"
  | "ocean"
  | "stone"
  | "ember"
  | "midnight";

const STORAGE_KEY = "lift-log-theme";

export function useThemeMode() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (
      storedTheme === "system" ||
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "sage" ||
      storedTheme === "ocean" ||
      storedTheme === "stone" ||
      storedTheme === "ember" ||
      storedTheme === "midnight"
    ) {
      setThemeMode(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;

    if (themeMode === "system") {
      root.removeAttribute("data-theme");
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    root.setAttribute("data-theme", themeMode);
    window.localStorage.setItem(STORAGE_KEY, themeMode);
  }, [themeMode]);

  return {
    setThemeMode,
    themeMode,
  };
}
