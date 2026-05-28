import type { Slide } from "@/lib/deck/schema";

/**
 * Compose a clean narration script from a slide. Strategy:
 *   1. If the slide has speaker notes, use them verbatim — that IS the script.
 *   2. Otherwise compose a sensible fallback from the slide's structured content.
 *
 * Markdown emphasis (**bold**, *italic*, `code`) gets stripped so TTS doesn't
 * say "asterisk asterisk bold asterisk asterisk".
 */
export function composeNarration(slide: Slide): string {
  if (slide.notes && slide.notes.trim()) return cleanForSpeech(slide.notes);

  let parts: Array<string | undefined>;
  switch (slide.kind) {
    case "title":
      parts = [slide.title, slide.subtitle];
      break;
    case "bullets":
      parts = [slide.title, ...slide.bullets.map((b) => `${b.text}${b.hint ? ". " + b.hint : ""}`)];
      break;
    case "quote":
      parts = [`"${slide.quote}"`, slide.attribution ? `— ${slide.attribution}` : undefined];
      break;
    case "stats":
      parts = [
        slide.title,
        slide.eyebrow,
        ...slide.stats.map((s) => `${s.value}. ${s.label}${s.hint ? ". " + s.hint : ""}`),
      ];
      break;
    case "chart":
      parts = [
        slide.title,
        slide.caption,
        ...slide.series.slice(0, 5).map((s) => `${s.label}: ${s.value}`),
      ];
      break;
    case "comparison":
      parts = [
        slide.title,
        `${slide.left.label}: ${slide.left.points.join(", ")}`,
        `${slide.right.label}: ${slide.right.points.join(", ")}`,
      ];
      break;
    case "timeline":
      parts = [
        slide.title,
        ...slide.steps.map((s) =>
          [s.when, s.label, s.body].filter(Boolean).join(". "),
        ),
      ];
      break;
    case "code":
      parts = [slide.title ?? "Code example.", slide.caption];
      break;
    case "image":
      parts = [slide.title, slide.alt, slide.caption];
      break;
    case "hero3d":
      parts = [slide.title, slide.subtitle];
      break;
    case "closing":
      parts = [slide.title, slide.subtitle];
      break;
  }

  return cleanForSpeech(parts.filter(Boolean).join(". "));
}

function cleanForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
