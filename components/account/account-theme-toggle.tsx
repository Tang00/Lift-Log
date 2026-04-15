"use client";

import styles from "@/components/account/account-view.module.css";
import type { CSSProperties } from "react";
import type { ThemeMode } from "@/utils/theme/theme-palettes";
import { getPaletteForMode, THEME_OPTIONS } from "@/utils/theme/theme-palettes";

type AccountThemeToggleProps = {
  onThemeChange: (value: ThemeMode) => void;
  themeMode: ThemeMode;
};

export function AccountThemeToggle({
  onThemeChange,
  themeMode,
}: AccountThemeToggleProps) {
  function getThemePreviewStyle(mode: ThemeMode): CSSProperties {
    const palette = getPaletteForMode(mode);
    return {
      ["--theme-swatch-bg" as string]: palette.bg,
      ["--theme-swatch-border" as string]:
        palette.colorScheme === "dark" ? "rgba(255,255,255,0.16)" : "rgba(20,20,20,0.14)",
      ["--theme-swatch-brand" as string]: palette.brand,
      ["--theme-swatch-muted" as string]: palette.muted,
      ["--theme-swatch-strong" as string]: palette.text,
    } as CSSProperties;
  }

  const coreThemes = THEME_OPTIONS.filter(
    (theme) => theme.mode === "system" || theme.mode === "light" || theme.mode === "dark",
  );
  const extraThemes = THEME_OPTIONS.filter(
    (theme) => theme.mode !== "system" && theme.mode !== "light" && theme.mode !== "dark",
  );

  return (
    <div className={styles.themeSections} role="group" aria-label="Theme">
      <div className={styles.themeList}>
        {coreThemes.map((theme) => (
          <button
            key={theme.mode}
            className={`${styles.themeListItem} ${themeMode === theme.mode ? styles.active : ""}`}
            type="button"
            onClick={() => onThemeChange(theme.mode)}
          >
            <span className={styles.themeListLabel}>{theme.label}</span>
            {theme.mode !== "system" && theme.mode !== "light" && theme.mode !== "dark" ? (
              <span className="theme-swatches" aria-hidden="true">
                {Array.from({ length: 4 }, (_, index) => (
                  <span
                    key={`${theme.mode}-${index}`}
                    className="theme-swatch"
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
                className={`${styles.themeListItem} ${themeMode === theme.mode ? styles.active : ""}`}
                style={getThemePreviewStyle(theme.mode)}
                type="button"
                onClick={() => onThemeChange(theme.mode)}
              >
                <span className={styles.themeListLabel}>{theme.label}</span>
                {theme.mode !== "system" && theme.mode !== "light" && theme.mode !== "dark" ? (
                  <span className="theme-swatches" aria-hidden="true">
                    {Array.from({ length: 4 }, (_, index) => (
                      <span
                        key={`${theme.mode}-${index}`}
                        className="theme-swatch"
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
