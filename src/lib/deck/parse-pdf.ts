import { extractText, getDocumentProxy } from "unpdf";
import type { RawDeck } from "./schema";

/**
 * PDF parsing: each page becomes one raw slide. unpdf gives us per-page text
 * arrays; we treat the first line as a likely title heuristic. The AI upgrader
 * does the heavy lifting of classifying the slide kind.
 */
export async function parsePdf(buf: Buffer, filename: string): Promise<RawDeck> {
  const data = new Uint8Array(buf);
  const doc = await getDocumentProxy(data);
  const result = await extractText(doc, { mergePages: false });
  const pages = Array.isArray(result.text) ? result.text : [String(result.text)];

  const slides = pages.map((pageText, i) => {
    const lines = String(pageText)
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);
    const [title, ...rest] = lines;
    return {
      id: `slide-${i + 1}`,
      index: i,
      title: title ?? undefined,
      text: rest,
      images: [],
    };
  });

  return {
    source: "pdf",
    title: filename.replace(/\.[^.]+$/, "") || "Untitled deck",
    slides,
  };
}
