import type { Theme } from "@/lib/deck/schema";

/**
 * Convert a Theme into an inline CSS custom-property string that overrides
 * the root tokens defined in globals.css. Apply via style={{ ... }} or a
 * <style> tag on a scope element.
 */
export function themeToCssVars(theme: Theme): Record<string, string> {
  const { colors, fonts } = theme;
  return {
    "--bg": colors.bg,
    "--surface": colors.surface,
    "--elevated": colors.elevated ?? colors.surface,
    "--fg": colors.fg,
    "--fg-muted": colors.fgMuted ?? "rgba(0,0,0,0.6)",
    "--fg-subtle": colors.fgMuted ?? "rgba(0,0,0,0.4)",
    "--line": colors.line ?? "rgba(0,0,0,0.08)",
    "--line-strong": colors.line ?? "rgba(0,0,0,0.18)",
    "--accent": colors.accent,
    "--accent-fg": colors.accentFg,
    "--brand": colors.brand,
    "--brand-fg": colors.brandFg,
    "--brand-hover": colors.brand,
    "--ring": colors.fg,
    "--font-sans": fonts.sans,
    "--font-display": fonts.display ?? fonts.sans,
    "--font-mono": fonts.mono ?? "monospace",
  };
}

export function radiusToScale(theme: Theme) {
  switch (theme.radius) {
    case "sharp":
      return { sm: 2, md: 4, lg: 6, xl: 8 };
    case "round":
      return { sm: 12, md: 18, lg: 28, xl: 40 };
    case "soft":
    default:
      return { sm: 6, md: 10, lg: 16, xl: 24 };
  }
}
