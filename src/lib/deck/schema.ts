import { z } from "zod";

/* ===========================================================================
   Deck schema — the canonical IR that:
     1. PPTX/PDF/Keynote parsers emit
     2. The AI upgrader transforms (enriches kind, layout, motion, components)
     3. The renderer reads to produce the interactive slideshow
   =========================================================================== */

export const themeSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: z.enum(["builtin", "url", "deck", "custom"]).default("builtin"),
  colors: z.object({
    bg: z.string(),
    surface: z.string(),
    elevated: z.string().optional(),
    fg: z.string(),
    fgMuted: z.string().optional(),
    line: z.string().optional(),
    accent: z.string(),
    accentFg: z.string(),
    brand: z.string(),
    brandFg: z.string(),
  }),
  fonts: z.object({
    sans: z.string(),
    display: z.string().optional(),
    mono: z.string().optional(),
  }),
  radius: z.enum(["sharp", "soft", "round"]).default("soft"),
  vibe: z
    .enum(["minimal", "editorial", "playful", "techno", "luxe", "brutalist"])
    .default("editorial"),
});
export type Theme = z.infer<typeof themeSchema>;

export const fragmentSchema = z.object({
  text: z.string(),
  hint: z.string().optional(),
  icon: z.string().optional(),
});

export const slideBaseSchema = z.object({
  id: z.string(),
  index: z.number(),
  notes: z.string().optional(),
  kind: z.string(),
  layout: z.enum(["center", "split-left", "split-right", "full", "stack"]).optional(),
  background: z
    .object({
      kind: z.enum(["solid", "gradient", "particles", "scene3d", "none"]),
      scene: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .optional(),
});

export const titleSlideSchema = slideBaseSchema.extend({
  kind: z.literal("title"),
  eyebrow: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  by: z.string().optional(),
});

export const bulletsSlideSchema = slideBaseSchema.extend({
  kind: z.literal("bullets"),
  title: z.string(),
  eyebrow: z.string().optional(),
  bullets: z.array(fragmentSchema),
});

export const quoteSlideSchema = slideBaseSchema.extend({
  kind: z.literal("quote"),
  quote: z.string(),
  attribution: z.string().optional(),
  role: z.string().optional(),
});

export const codeSlideSchema = slideBaseSchema.extend({
  kind: z.literal("code"),
  title: z.string().optional(),
  language: z.string().default("ts"),
  code: z.string(),
  caption: z.string().optional(),
});

export const imageSlideSchema = slideBaseSchema.extend({
  kind: z.literal("image"),
  title: z.string().optional(),
  src: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

export const chartSlideSchema = slideBaseSchema.extend({
  kind: z.literal("chart"),
  title: z.string(),
  chartKind: z.enum(["bar", "line", "donut", "area"]).default("bar"),
  caption: z.string().optional(),
  series: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
      hint: z.string().optional(),
    }),
  ),
});

export const timelineSlideSchema = slideBaseSchema.extend({
  kind: z.literal("timeline"),
  title: z.string(),
  steps: z.array(
    z.object({
      label: z.string(),
      body: z.string().optional(),
      when: z.string().optional(),
    }),
  ),
});

export const comparisonSlideSchema = slideBaseSchema.extend({
  kind: z.literal("comparison"),
  title: z.string(),
  left: z.object({
    label: z.string(),
    points: z.array(z.string()),
    tone: z.enum(["neutral", "negative", "muted"]).default("muted"),
  }),
  right: z.object({
    label: z.string(),
    points: z.array(z.string()),
    tone: z.enum(["neutral", "positive", "accent"]).default("accent"),
  }),
});

export const statsSlideSchema = slideBaseSchema.extend({
  kind: z.literal("stats"),
  title: z.string().optional(),
  eyebrow: z.string().optional(),
  stats: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        hint: z.string().optional(),
      }),
    )
    .min(1)
    .max(4),
});

export const hero3dSlideSchema = slideBaseSchema.extend({
  kind: z.literal("hero3d"),
  title: z.string(),
  subtitle: z.string().optional(),
  scene: z.enum(["torus", "sphere", "ribbon", "particles", "wireframe"]).default("torus"),
  cta: z.string().optional(),
});

export const closingSlideSchema = slideBaseSchema.extend({
  kind: z.literal("closing"),
  title: z.string(),
  subtitle: z.string().optional(),
  cta: z.string().optional(),
  ctaHref: z.string().optional(),
});

export const slideSchema = z.discriminatedUnion("kind", [
  titleSlideSchema,
  bulletsSlideSchema,
  quoteSlideSchema,
  codeSlideSchema,
  imageSlideSchema,
  chartSlideSchema,
  timelineSlideSchema,
  comparisonSlideSchema,
  statsSlideSchema,
  hero3dSlideSchema,
  closingSlideSchema,
]);
export type Slide = z.infer<typeof slideSchema>;

export const deckSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  author: z.string().optional(),
  theme: themeSchema,
  slides: z.array(slideSchema),
});
export type Deck = z.infer<typeof deckSchema>;

/* Pre-upgrade raw extraction shape. The parser emits this; the upgrader turns
   it into a Deck with proper slide kinds. Kept loose intentionally. */
export const rawSlideSchema = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string().optional(),
  text: z.array(z.string()).default([]),
  notes: z.string().optional(),
  images: z.array(z.string()).default([]),
});
export type RawSlide = z.infer<typeof rawSlideSchema>;

export const rawDeckSchema = z.object({
  source: z.enum(["pptx", "pdf", "keynote", "markdown", "manual"]),
  title: z.string(),
  slides: z.array(rawSlideSchema),
});
export type RawDeck = z.infer<typeof rawDeckSchema>;
