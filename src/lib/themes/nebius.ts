import type { Theme } from "@/lib/deck/schema";

/**
 * Nebius brand tokens — verified against nebius.com (2026-05) and
 * github.com/opencolin/nebius-devsite.
 *
 * Light: warm off-white #f3efe8 / navy #052b42 / neon-lime #e0ff4f
 * Dark:  deep navy #061a26 / lime stays vibrant against the navy
 */
export const nebiusTheme: Theme = {
  id: "nebius",
  name: "Nebius",
  source: "builtin",
  colors: {
    bg: "#f3efe8",
    surface: "#ffffff",
    elevated: "#ffffff",
    fg: "#052b42",
    fgMuted: "rgba(5,43,66,0.62)",
    line: "rgba(5,43,66,0.10)",
    accent: "#e0ff4f",
    accentFg: "#052b42",
    brand: "#052b42",
    brandFg: "#ffffff",
  },
  fonts: {
    sans: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    display: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "JetBrains Mono, Menlo, Monaco, monospace",
  },
  radius: "soft",
  vibe: "editorial",
};

export const nebiusDarkTheme: Theme = {
  ...nebiusTheme,
  id: "nebius-dark",
  name: "Nebius Dark",
  colors: {
    ...nebiusTheme.colors,
    bg: "#061a26",
    surface: "#0a2638",
    elevated: "#0f3047",
    fg: "#e8eff4",
    fgMuted: "rgba(232,239,244,0.62)",
    line: "rgba(232,239,244,0.12)",
    accent: "#e0ff4f",
    accentFg: "#052b42",
    brand: "#e0ff4f",
    brandFg: "#052b42",
  },
};
