import type { Theme } from "@/lib/deck/schema";
import { nebiusTheme, nebiusDarkTheme } from "./nebius";

export const themes: Record<string, Theme> = {
  nebius: nebiusTheme,
  "nebius-dark": nebiusDarkTheme,
  vercel: {
    id: "vercel",
    name: "Vercel",
    source: "builtin",
    colors: {
      bg: "#000000",
      surface: "#0a0a0a",
      elevated: "#171717",
      fg: "#fafafa",
      fgMuted: "rgba(250,250,250,0.6)",
      line: "rgba(255,255,255,0.10)",
      accent: "#ffffff",
      accentFg: "#000000",
      brand: "#ffffff",
      brandFg: "#000000",
    },
    fonts: {
      sans: "Geist, system-ui, sans-serif",
      mono: "Geist Mono, monospace",
    },
    radius: "sharp",
    vibe: "techno",
  },
  arctic: {
    id: "arctic",
    name: "Arctic",
    source: "builtin",
    colors: {
      bg: "#f5f7fa",
      surface: "#ffffff",
      fg: "#0b1e2c",
      accent: "#4fa3ff",
      accentFg: "#ffffff",
      brand: "#0b1e2c",
      brandFg: "#ffffff",
      line: "rgba(11,30,44,0.08)",
    },
    fonts: { sans: "Inter, sans-serif" },
    radius: "round",
    vibe: "minimal",
  },
  oxide: {
    id: "oxide",
    name: "Oxide",
    source: "builtin",
    colors: {
      bg: "#0f0d0c",
      surface: "#1a1714",
      fg: "#f5ebdc",
      accent: "#ff5722",
      accentFg: "#ffffff",
      brand: "#ff5722",
      brandFg: "#ffffff",
      line: "rgba(245,235,220,0.10)",
    },
    fonts: { sans: "Inter, sans-serif" },
    radius: "sharp",
    vibe: "brutalist",
  },
};

export { nebiusTheme, nebiusDarkTheme };

export function getTheme(id: string | undefined | null): Theme {
  if (!id) return nebiusTheme;
  return themes[id] ?? nebiusTheme;
}
