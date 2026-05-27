import { parseOffice, type OfficeContentNode } from "officeparser";
import type { RawDeck, RawSlide } from "./schema";

/**
 * officeparser v7 emits an AST with explicit `slide` nodes — and `note` nodes
 * keyed back by slide via their parent. We walk the top-level children,
 * collecting every slide and its inline text/heading/list content. PPT
 * content is intentionally lossy here: we keep titles and bullet text and
 * leave layout to the AI upgrader.
 */
export async function parsePptx(buf: Buffer, filename: string): Promise<RawDeck> {
  const ast = await parseOffice(buf as unknown as ArrayBuffer);
  const slides: RawSlide[] = [];
  let slideCount = 0;

  walkSlides(ast.content as OfficeContentNode[] | undefined, (slideNode) => {
    const lines = collectTextLines(slideNode);
    const [first, ...rest] = lines;
    const notes = collectNotes(slideNode);
    slides.push({
      id: `slide-${slideCount + 1}`,
      index: slideCount,
      title: first,
      text: rest,
      notes,
      images: [],
    });
    slideCount += 1;
  });

  // Fallback: if no explicit slide nodes were found, treat the whole document
  // as one slide so we never return an empty deck.
  if (!slides.length) {
    const text = collectTextLines(ast as unknown as OfficeContentNode);
    slides.push({
      id: "slide-1",
      index: 0,
      title: text[0],
      text: text.slice(1),
      images: [],
    });
  }

  return {
    source: "pptx",
    title: filename.replace(/\.[^.]+$/, "") || ast.metadata?.title || "Untitled deck",
    slides,
  };
}

function walkSlides(
  nodes: OfficeContentNode[] | undefined,
  emit: (slide: OfficeContentNode) => void,
) {
  if (!nodes) return;
  for (const n of nodes) {
    if (n.type === "slide") emit(n);
    if (n.children) walkSlides(n.children, emit);
  }
}

function collectTextLines(node: OfficeContentNode | undefined): string[] {
  if (!node) return [];
  const out: string[] = [];
  walkText(node, (line) => {
    const t = line.trim();
    if (t) out.push(t);
  });
  return out;
}

function walkText(node: OfficeContentNode, emit: (line: string) => void) {
  // Skip notes when collecting body text — we handle notes separately.
  if (node.type === "note") return;
  if ((node.type === "paragraph" || node.type === "heading" || node.type === "text" ||
      node.type === "cell" || node.type === "list") && node.text) {
    emit(node.text);
    return; // don't double-emit by recursing into the same text
  }
  if (node.children) {
    for (const child of node.children) walkText(child, emit);
  }
}

function collectNotes(node: OfficeContentNode): string | undefined {
  const parts: string[] = [];
  walkAll(node, (n) => {
    if (n.type === "note" && n.text) parts.push(n.text);
  });
  return parts.length ? parts.join(" ") : undefined;
}

function walkAll(node: OfficeContentNode, visit: (n: OfficeContentNode) => void) {
  visit(node);
  if (node.children) for (const child of node.children) walkAll(child, visit);
}
