import { generateText } from "ai";
import { z } from "zod";
import type { Deck, RawDeck, Slide, Theme } from "@/lib/deck/schema";
import { nebiusTheme } from "@/lib/themes/nebius";
import { slugify } from "@/lib/utils";

/**
 * Upgrade pipeline: RawDeck -> Deck.
 *
 * Two strategies, picked at runtime:
 *   1. AI: call the AI Gateway with the raw slides + the kind catalog, ask
 *      the model to emit an upgraded Deck. Streams ideal but generateObject is
 *      simpler for the v0.
 *   2. Heuristic: if no AI key is set, classify each slide by simple rules
 *      (text length, presence of code fences, comparison cues like "vs",
 *      digit-only stats, etc.). Lets the local demo run with zero config.
 */

export async function upgradeRawDeck(
  raw: RawDeck,
  opts: { theme?: Theme; model?: string } = {},
): Promise<Deck> {
  const theme = opts.theme ?? nebiusTheme;
  const hasGateway =
    !!process.env.AI_GATEWAY_API_KEY || !!process.env.VERCEL_OIDC_TOKEN;

  if (!hasGateway) {
    return heuristicUpgrade(raw, theme);
  }
  try {
    return await aiUpgrade(raw, theme, opts.model);
  } catch (err) {
    console.warn("[superslide] AI upgrade failed, falling back to heuristic:", err);
    return heuristicUpgrade(raw, theme);
  }
}

/* -------------------------------------------------------------------------- */
/*                              Heuristic upgrade                             */
/* -------------------------------------------------------------------------- */

export function heuristicUpgrade(raw: RawDeck, theme: Theme): Deck {
  const id = slugify(raw.title) || "deck";
  const slides: Slide[] = raw.slides.map((r, i) => {
    const text = r.text.filter(Boolean);
    const blob = [r.title, ...text].filter(Boolean).join("\n");
    const isFirst = i === 0;
    const isLast = i === raw.slides.length - 1;

    // Closing slide: last slide, short.
    if (isLast && text.length <= 3) {
      return {
        kind: "closing",
        id: r.id,
        index: i,
        title: r.title ?? "Thank you.",
        subtitle: text.join(" ") || undefined,
        cta: text.find((t) => /^(apply|join|sign up|get started|learn more)/i.test(t)),
      };
    }

    // Title: first slide, short.
    if (isFirst && text.length <= 3) {
      return {
        kind: "title",
        id: r.id,
        index: i,
        title: r.title ?? raw.title,
        eyebrow: text[0],
        subtitle: text.slice(1).join(" ") || undefined,
      };
    }

    // Code: presence of code-ish characters.
    if (/[{};=()<>]/.test(blob) && /\n/.test(blob) && text.length >= 1) {
      return {
        kind: "code",
        id: r.id,
        index: i,
        title: r.title,
        language: detectLang(blob),
        code: text.join("\n"),
      };
    }

    // Quote: long single-line text without bullet structure.
    if (text.length === 1 && text[0].length > 60) {
      return {
        kind: "quote",
        id: r.id,
        index: i,
        quote: text[0].replace(/^["“”]|["“”]$/g, ""),
        attribution: r.title,
      };
    }

    // Stats: most text items are number-like.
    if (text.length <= 4 && text.filter(isStatish).length >= Math.ceil(text.length * 0.6)) {
      return {
        kind: "stats",
        id: r.id,
        index: i,
        title: r.title,
        stats: text.slice(0, 4).map((t) => splitStat(t)),
      };
    }

    // Comparison: title contains vs / versus / "before / after".
    if (r.title && /\b(vs|versus|before|after)\b/i.test(r.title) && text.length >= 4) {
      const half = Math.ceil(text.length / 2);
      return {
        kind: "comparison",
        id: r.id,
        index: i,
        title: r.title,
        left: { label: "Before", tone: "muted", points: text.slice(0, half) },
        right: { label: "After", tone: "accent", points: text.slice(half) },
      };
    }

    // Default: bullets.
    return {
      kind: "bullets",
      id: r.id,
      index: i,
      eyebrow: undefined,
      title: r.title ?? "Highlights",
      bullets: text.slice(0, 6).map((t) => ({ text: t })),
    };
  });

  return {
    id,
    title: raw.title,
    theme,
    slides,
  };
}

function detectLang(s: string): string {
  if (/\bdef |import |print\(/.test(s)) return "py";
  if (/\bSELECT |FROM |WHERE /i.test(s)) return "sql";
  if (/\bfn |let mut |impl /.test(s)) return "rs";
  if (/\bfunc |package |fmt\./.test(s)) return "go";
  if (/\bconst |let |interface |export /.test(s)) return "ts";
  return "ts";
}

function isStatish(t: string): boolean {
  return /^[\d$€£¥]+[\d,.kKmMbB%+xX]*/.test(t) || /\d+\s*[%xX]/.test(t);
}

function splitStat(t: string): { value: string; label: string } {
  const m = t.match(/^([\d$€£¥][\d,.kKmMbB%+xX]*)[\s—:-]+(.+)$/);
  if (m) return { value: m[1], label: m[2] };
  return { value: t.slice(0, 6), label: t.slice(6).trim() || "metric" };
}

/* -------------------------------------------------------------------------- */
/*                                  AI upgrade                                */
/* -------------------------------------------------------------------------- */

const aiSlideSchema = z.object({
  kind: z.enum([
    "title",
    "bullets",
    "quote",
    "code",
    "stats",
    "comparison",
    "timeline",
    "hero3d",
    "closing",
  ]),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  eyebrow: z.string().optional(),
  quote: z.string().optional(),
  attribution: z.string().optional(),
  language: z.string().optional(),
  code: z.string().optional(),
  caption: z.string().optional(),
  scene: z.enum(["torus", "sphere", "ribbon", "particles", "wireframe"]).optional(),
  cta: z.string().optional(),
  bullets: z
    .array(z.object({ text: z.string(), hint: z.string().optional() }))
    .optional(),
  stats: z
    .array(z.object({ value: z.string(), label: z.string(), hint: z.string().optional() }))
    .optional(),
  steps: z
    .array(z.object({ label: z.string(), body: z.string().optional(), when: z.string().optional() }))
    .optional(),
  comparison: z
    .object({
      left: z.object({ label: z.string(), points: z.array(z.string()) }),
      right: z.object({ label: z.string(), points: z.array(z.string()) }),
    })
    .optional(),
});

const aiDeckSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  slides: z.array(aiSlideSchema),
});

export async function aiUpgrade(
  raw: RawDeck,
  theme: Theme,
  model = "anthropic/claude-haiku-4-5",
): Promise<Deck> {
  const condensed = raw.slides
    .map(
      (s) =>
        `### Slide ${s.index + 1}\n${s.title ? `Title: ${s.title}\n` : ""}${
          s.text.length ? `Body:\n- ${s.text.join("\n- ")}\n` : ""
        }${s.notes ? `Notes: ${s.notes}\n` : ""}`,
    )
    .join("\n");

  const t0 = Date.now();
  // Per-slide upgrade so each model call has a flat schema — much faster +
  // more reliable than asking the model to emit a whole nested deck in one
  // shot. We classify each slide in parallel.
  const slidesOut = await Promise.all(
    raw.slides.map((s, i) => upgradeOneSlide(s, raw, theme, model, i, condensed)),
  );

  const slides: Slide[] = slidesOut.map((s, i) => coerceSlide(s, i));
  const deckTitle =
    slides.find((s) => s.kind === "title")?.title ?? raw.title;

  console.log("[superslide] aiUpgrade done", {
    slides: slides.length,
    ms: Date.now() - t0,
  });

  return {
    id: slugify(deckTitle) || "deck",
    title: deckTitle,
    subtitle: undefined,
    theme,
    slides,
  };
}

async function upgradeOneSlide(
  s: RawDeck["slides"][number],
  raw: RawDeck,
  theme: Theme,
  model: string,
  index: number,
  fullDeckDigest: string,
): Promise<z.infer<typeof aiSlideSchema>> {
  const isFirst = index === 0;
  const isLast = index === raw.slides.length - 1;
  const slideText =
    `Slide ${index + 1} of ${raw.slides.length}` +
    (isFirst ? " (FIRST slide)" : "") +
    (isLast ? " (LAST slide)" : "") +
    `\n${s.title ? `Title: ${s.title}\n` : ""}` +
    (s.text.length ? `Body:\n- ${s.text.join("\n- ")}\n` : "") +
    (s.notes ? `Speaker notes: ${s.notes}\n` : "");

  const t0 = Date.now();
  try {
    const { text } = await generateText({
      model,
      maxRetries: 1,
      system:
        SYSTEM_PROMPT +
        "\n\nIMPORTANT: Respond with ONLY a valid JSON object. No markdown fences, no prose before or after. Just the JSON.",
      prompt:
        `Deck title: ${raw.title}\n` +
        `Theme accent color: ${theme.colors.accent}\n\n` +
        slideText +
        `\nProduce the upgraded slide as a single JSON object. Use the BEST kind from the catalog. ` +
        `Fields you might use: kind (required), title, subtitle, eyebrow, quote, attribution, language, code, caption, scene, cta, bullets[].text/hint, stats[].value/label/hint, steps[].label/body/when, comparison.left/right.{label,points[]}.`,
    });
    const object = parseSlideJson(text);
    if (!object) throw new Error("Could not parse slide JSON");
    const parsed = aiSlideSchema.safeParse(object);
    if (!parsed.success) throw new Error("Slide JSON did not match schema");
    console.log(
      `[superslide] slide ${index + 1} done in ${Date.now() - t0}ms, kind=${parsed.data.kind}`,
    );
    return parsed.data;
  } catch (err) {
    console.warn(
      `[superslide] slide ${index + 1} FAILED after ${Date.now() - t0}ms:`,
      err instanceof Error ? err.message : err,
    );
    void fullDeckDigest;
    return aiSlideFromHeuristic(s, isFirst, isLast);
  }
}

function parseSlideJson(text: string): unknown {
  const trimmed = text.trim();
  // Try direct JSON first
  try {
    return JSON.parse(trimmed);
  } catch {}
  // Strip markdown fences if the model wrapped output anyway
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {}
  }
  // Find the first { ... } block by brace matching
  const startIdx = trimmed.indexOf("{");
  if (startIdx === -1) return null;
  let depth = 0;
  for (let i = startIdx; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(trimmed.slice(startIdx, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function aiSlideFromHeuristic(
  s: RawDeck["slides"][number],
  isFirst: boolean,
  isLast: boolean,
): z.infer<typeof aiSlideSchema> {
  const text = s.text.filter(Boolean);
  if (isFirst && text.length <= 3) {
    return { kind: "title", title: s.title ?? "Untitled", subtitle: text.join(" ") };
  }
  if (isLast && text.length <= 3) {
    return { kind: "closing", title: s.title ?? "Thank you.", subtitle: text.join(" ") };
  }
  return {
    kind: "bullets",
    title: s.title ?? "Highlights",
    bullets: text.slice(0, 6).map((t) => ({ text: t })),
  };
}

function coerceSlide(s: z.infer<typeof aiSlideSchema>, i: number): Slide {
  const base = { id: `slide-${i + 1}`, index: i } as const;
  switch (s.kind) {
    case "title":
      return { ...base, kind: "title", title: s.title ?? "Untitled", subtitle: s.subtitle, eyebrow: s.eyebrow };
    case "bullets":
      return {
        ...base,
        kind: "bullets",
        title: s.title ?? "Highlights",
        eyebrow: s.eyebrow,
        bullets: (s.bullets ?? []).slice(0, 6),
      };
    case "quote":
      return {
        ...base,
        kind: "quote",
        quote: s.quote ?? s.title ?? "—",
        attribution: s.attribution,
      };
    case "code":
      return {
        ...base,
        kind: "code",
        title: s.title,
        language: s.language ?? "ts",
        code: s.code ?? "",
        caption: s.caption,
      };
    case "stats":
      return {
        ...base,
        kind: "stats",
        title: s.title,
        eyebrow: s.eyebrow,
        stats: (s.stats ?? []).slice(0, 4) as Extract<Slide, { kind: "stats" }>["stats"],
      };
    case "comparison":
      return {
        ...base,
        kind: "comparison",
        title: s.title ?? "Compare",
        left: {
          label: s.comparison?.left.label ?? "Before",
          tone: "muted",
          points: s.comparison?.left.points ?? [],
        },
        right: {
          label: s.comparison?.right.label ?? "After",
          tone: "accent",
          points: s.comparison?.right.points ?? [],
        },
      };
    case "timeline":
      return {
        ...base,
        kind: "timeline",
        title: s.title ?? "Timeline",
        steps: (s.steps ?? []).slice(0, 5),
      };
    case "hero3d":
      return {
        ...base,
        kind: "hero3d",
        title: s.title ?? "—",
        subtitle: s.subtitle,
        scene: s.scene ?? "torus",
        cta: s.cta,
      };
    case "closing":
      return {
        ...base,
        kind: "closing",
        title: s.title ?? "Thank you.",
        subtitle: s.subtitle,
        cta: s.cta,
      };
  }
}

const SYSTEM_PROMPT = `You are a presentation designer rebuilding a flat slide deck as a richer, interactive web slideshow.

For each source slide, choose the BEST kind from this catalog:
- title: opening/section opener, 1-3 short lines max
- bullets: 2-6 concise items, each with optional one-line hint
- quote: single strong quote + attribution
- code: code sample with language
- stats: 1-4 hero numbers, each "value" + "label" + optional "hint"
- comparison: two columns (left=before/old/them, right=after/new/us) — the right side gets the accent color, so put the WINNING side there
- timeline: 3-5 ordered steps with when/label/body
- hero3d: dramatic single-message slide (use sparingly, max 1 per deck) — pick a scene
- closing: final CTA slide

Rules:
- Be concise. Bullets and stats are SHORTER than the source — rewrite to be punchier, never longer.
- Don't invent facts. Only restructure what's there.
- Use "title" for slide 1 and "closing" for the final slide if appropriate.
- If a slide is just one big metric, use "stats". If it's a person quote, use "quote".
- If you see "vs", "before/after", "old/new", emit "comparison" with the new/winning side as right.
- For code slides, infer the language and preserve the code verbatim.
- For hero3d, pick "torus" for tech/AI, "ribbon" for flow/motion, "sphere" for organic, "wireframe" for engineering, "particles" for data.
- Output the final upgraded deck as JSON matching the schema. Keep slide ordering.`;
