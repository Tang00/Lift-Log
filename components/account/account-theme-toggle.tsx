"use client";

import styles from "@/components/account/account-view.module.css";

type AccountThemeToggleProps = {
  onThemeChange: (value: "system" | "light" | "dark") => void;
  themeMode: "system" | "light" | "dark";
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
    </div>
  );
}
