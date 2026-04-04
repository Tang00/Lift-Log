"use client";

import styles from "@/components/account/account-view.module.css";
import type { ThemeMode } from "@/hooks/ui/use-theme-mode";

type AccountThemeToggleProps = {
  onThemeChange: (value: ThemeMode) => void;
  themeMode: ThemeMode;
};

export function AccountThemeToggle({
  onThemeChange,
  themeMode,
}: AccountThemeToggleProps) {
  const themes: Array<{
    mode: ThemeMode;
    label: string;
  }> = [
    { mode: "system", label: "System" },
    { mode: "light", label: "Light" },
    { mode: "dark", label: "Dark" },
    { mode: "sage", label: "Sage" },
    { mode: "ocean", label: "Ocean" },
    { mode: "stone", label: "Stone" },
    { mode: "ember", label: "Ember" },
    { mode: "midnight", label: "Midnight" },
  ];
  const coreThemes = themes.filter((theme) => theme.mode === "system" || theme.mode === "light" || theme.mode === "dark");
  const extraThemes = themes.filter((theme) => theme.mode !== "system" && theme.mode !== "light" && theme.mode !== "dark");

  return (
    <div className={styles.themeSections} role="group" aria-label="Theme">
      <div className={styles.themeList}>
        {coreThemes.map((theme) => (
          <button
            key={theme.mode}
            className={`${styles.themeListItem} ${styles[`themePreview${theme.mode[0].toUpperCase()}${theme.mode.slice(1)}`]} ${themeMode === theme.mode ? styles.active : ""}`}
            type="button"
            onClick={() => onThemeChange(theme.mode)}
          >
            <span className={styles.themeListLabel}>{theme.label}</span>
            {theme.mode !== "system" && theme.mode !== "light" && theme.mode !== "dark" ? (
              <span className={styles.themeSwatches} aria-hidden="true">
                {Array.from({ length: 4 }, (_, index) => (
                  <span
                    key={`${theme.mode}-${index}`}
                    className={styles.themeSwatch}
                  />
                ))}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {extraThemes.length > 0 ? (
        <div className={styles.themeSubsection}>
          <div className={styles.themeSectionLabel}>Other themes</div>
          <div className={styles.themeList}>
            {extraThemes.map((theme) => (
              <button
                key={theme.mode}
                className={`${styles.themeListItem} ${styles[`themePreview${theme.mode[0].toUpperCase()}${theme.mode.slice(1)}`]} ${themeMode === theme.mode ? styles.active : ""}`}
                type="button"
                onClick={() => onThemeChange(theme.mode)}
              >
                <span className={styles.themeListLabel}>{theme.label}</span>
                {theme.mode !== "system" && theme.mode !== "light" && theme.mode !== "dark" ? (
                  <span className={styles.themeSwatches} aria-hidden="true">
                    {Array.from({ length: 4 }, (_, index) => (
                      <span
                        key={`${theme.mode}-${index}`}
                        className={styles.themeSwatch}
                      />
                    ))}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
