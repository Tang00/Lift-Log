"use client";

import styles from "@/components/account/account-view.module.css";
import type { ThemeMode } from "@/hooks/use-theme-mode";

type AccountThemeToggleProps = {
  onThemeChange: (value: ThemeMode) => void;
  themeMode: ThemeMode;
};

export function AccountThemeToggle({
  onThemeChange,
  themeMode,
}: AccountThemeToggleProps) {
  return (
    <div className={styles.themeToggle} role="group" aria-label="Theme">
      <button
        className={`${styles.themeToggleButton} ${themeMode === "system" ? styles.active : ""}`}
        type="button"
        onClick={() => onThemeChange("system")}
      >
        System
      </button>
      <button
        className={`${styles.themeToggleButton} ${themeMode === "light" ? styles.active : ""}`}
        type="button"
        onClick={() => onThemeChange("light")}
      >
        Light
      </button>
      <button
        className={`${styles.themeToggleButton} ${themeMode === "dark" ? styles.active : ""}`}
        type="button"
        onClick={() => onThemeChange("dark")}
      >
        Dark
      </button>
      <button
        className={`${styles.themeToggleButton} ${themeMode === "sage" ? styles.active : ""}`}
        type="button"
        onClick={() => onThemeChange("sage")}
      >
        Sage
      </button>
    </div>
  );
}
