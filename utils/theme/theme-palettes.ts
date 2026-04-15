import { ThemesList, themes, type Theme } from "@/utils/theme/themes";

type ImportedThemeName = keyof typeof themes;

export type ThemeMode = "system" | "light" | "dark" | ImportedThemeName;

export type ThemePalette = {
  backdrop: string;
  bg: string;
  brand: string;
  colorScheme: "light" | "dark";
  danger: string;
  muted: string;
  success: string;
  surface: string;
  text: string;
};

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  if (normalized.length === 3 || normalized.length === 4) {
    const expanded = normalized
      .slice(0, 3)
      .split("")
      .map((char) => char + char)
      .join("");
    return {
      b: Number.parseInt(expanded.slice(4, 6), 16),
      g: Number.parseInt(expanded.slice(2, 4), 16),
      r: Number.parseInt(expanded.slice(0, 2), 16),
    };
  }

  return {
    b: Number.parseInt(normalized.slice(4, 6), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    r: Number.parseInt(normalized.slice(0, 2), 16),
  };
}

function getRelativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((value) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function getColorScheme(bg: string): "light" | "dark" {
  return getRelativeLuminance(bg) < 0.34 ? "dark" : "light";
}

function toBackdrop(bg: string, colorScheme: "light" | "dark") {
  const { r, g, b } = hexToRgb(bg);
  const alpha = colorScheme === "dark" ? 0.56 : 0.42;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function toPalette(theme: Theme): ThemePalette {
  const colorScheme = getColorScheme(theme.bg);

  return {
    backdrop: toBackdrop(theme.bg, colorScheme),
    bg: theme.bg,
    brand: theme.main,
    colorScheme,
    danger: theme.error,
    muted: theme.sub,
    success: theme.caret,
    surface: theme.subAlt,
    text: theme.text,
  };
}

function formatThemeLabel(name: string) {
  return name
    .split(/[_\s]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const STANDARD_THEME_PALETTES = {
  light: {
    backdrop: "rgba(0, 0, 0, 0.48)",
    bg: "#f3f3f1",
    brand: "#1e1e1e",
    colorScheme: "light",
    danger: "#b84032",
    muted: "#6d6d6d",
    success: "#2d2d2d",
    surface: "#fcfcfb",
    text: "#141414",
  },
  dark: {
    backdrop: "rgba(0, 0, 0, 0.48)",
    bg: "#0f0f10",
    brand: "#f4f4f2",
    colorScheme: "dark",
    danger: "#f07c6f",
    muted: "#a4a4a1",
    success: "#d8d8d5",
    surface: "#171718",
    text: "#f4f4f2",
  },
} satisfies Record<"light" | "dark", ThemePalette>;

const IMPORTED_THEME_PALETTES = Object.fromEntries(
  ThemesList.map((theme) => [theme.name, toPalette(theme)]),
) as Record<ImportedThemeName, ThemePalette>;

const STANDARD_THEME_MODES = new Set<ThemeMode>(["light", "dark"]);

export const THEME_PALETTES: Record<Exclude<ThemeMode, "system">, ThemePalette> = {
  ...STANDARD_THEME_PALETTES,
  ...IMPORTED_THEME_PALETTES,
};

export const THEME_OPTIONS: Array<{ label: string; mode: ThemeMode }> = [
  { mode: "system", label: "System" },
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
  ...ThemesList.filter((theme) => !STANDARD_THEME_MODES.has(theme.name as ThemeMode)).map(
    (theme) => ({
      label: formatThemeLabel(theme.name),
      mode: theme.name as ImportedThemeName,
    }),
  ),
];

export function getSystemThemeMode(): Exclude<ThemeMode, "system"> {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

export function getPaletteForMode(mode: ThemeMode): ThemePalette {
  return THEME_PALETTES[mode === "system" ? getSystemThemeMode() : mode];
}
