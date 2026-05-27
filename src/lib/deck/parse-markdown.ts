import type { RawDeck, RawSlide } from "./schema";

/**
 * Markdown deck parser. Mirrors the de-facto convention used by Reveal.js,
 * Marp, and Slidev:
 *
 *   ---
 *   title: My talk           ← optional YAML-ish frontmatter
 *   author: Me
 *   ---
 *
 *   # Slide one              ← first heading is the slide title
 *
 *   - bullet a               ← bullets/numbered lists become body text
 *   - bullet b               (markers stripped)
 *
 *   <!-- notes: speaker says X --> ← optional speaker notes
 *
 *   ---                      ← horizontal rule on its own line = new slide
 *
 *   # Slide two
 *
 *   ```ts
 *   const x = 1;             ← fenced code blocks collapse to one text
 *   ```                      entry so the upgrader can classify as code
 *
 *   ![alt](https://...)      ← image refs collected into the images array
 *
 * The parser stays loose on purpose — the AI upgrader decides slide kind.
 */
export function parseMarkdown(buf: Buffer, filename: string): RawDeck {
  const text = buf.toString("utf-8").replace(/\r\n?/g, "\n");
  const { meta, body } = extractFrontmatter(text);
  const blocks = splitSlides(body);

  const slides: RawSlide[] = blocks
    .map((block, i) => parseBlock(block, i))
    .filter((s) => s.title || s.text.length || s.images.length);

  // Re-index after empty-slide drop so consumers can rely on s.index.
  slides.forEach((s, i) => {
    s.index = i;
    s.id = `slide-${i + 1}`;
  });

  return {
    source: "markdown",
    title: meta.title || filename.replace(/\.[^.]+$/, "") || "Untitled deck",
    slides,
  };
}

function extractFrontmatter(text: string): {
  meta: Record<string, string>;
  body: string;
} {
  if (!text.startsWith("---\n")) return { meta: {}, body: text };
  const end = text.indexOf("\n---", 4);
  if (end < 0) return { meta: {}, body: text };
  const fm = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\n/, "");
  const meta: Record<string, string> = {};
  for (const line of fm.split("\n")) {
    const m = line.match(/^([\w-]+)\s*:\s*(.+)$/);
    if (m) meta[m[1].trim().toLowerCase()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body };
}

function splitSlides(body: string): string[] {
  // A standalone "---" line (not a setext underline) separates slides.
  // Avoid splitting on the underline form by requiring no surrounding text on
  // adjacent lines, which is implicit since we match the whole line.
  return body
    .split(/^\s*---\s*$/m)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);
}

function parseBlock(block: string, index: number): RawSlide {
  const rawLines = block.split("\n");
  let title: string | undefined;
  const notes: string[] = [];
  const images: string[] = [];
  const bodyLines: string[] = [];

  // Strip leading title heading if present.
  let i = 0;
  for (; i < rawLines.length; i++) {
    const trimmed = rawLines[i].trim();
    if (!trimmed) continue;
    const h = trimmed.match(/^#{1,2}\s+(.+)$/);
    if (h) {
      title = h[1].trim();
      i += 1;
      break;
    }
    break;
  }

  const remaining = rawLines.slice(i);
  let inFence = false;
  let fenceBuffer: string[] = [];

  for (const raw of remaining) {
    const noteMatch = raw.match(/<!--\s*notes?:\s*([\s\S]*?)\s*-->/i);
    if (noteMatch) {
      notes.push(noteMatch[1].trim());
      continue;
    }
    if (raw.trim().startsWith("```")) {
      if (inFence) {
        fenceBuffer.push(raw);
        bodyLines.push(fenceBuffer.join("\n"));
        fenceBuffer = [];
        inFence = false;
      } else {
        inFence = true;
        fenceBuffer = [raw];
      }
      continue;
    }
    if (inFence) {
      fenceBuffer.push(raw);
      continue;
    }
    const imgMatch = raw.match(/!\[[^\]]*\]\(([^)]+)\)/g);
    if (imgMatch) {
      for (const ref of imgMatch) {
        const src = ref.match(/\(([^)]+)\)/)?.[1];
        if (src) images.push(src);
      }
    }
    const stripped = stripMarkdownPrefix(raw).trim();
    if (stripped) bodyLines.push(stripped);
  }
  if (inFence && fenceBuffer.length) {
    bodyLines.push(fenceBuffer.join("\n") + "\n```");
  }

  return {
    id: `slide-${index + 1}`,
    index,
    title,
    text: bodyLines,
    notes: notes.length ? notes.join(" ") : undefined,
    images,
  };
}

function stripMarkdownPrefix(line: string): string {
  return line
    .replace(/^\s*[-*+]\s+/, "")
    .replace(/^\s*\d+\.\s+/, "")
    .replace(/^\s*>\s?/, "");
}
