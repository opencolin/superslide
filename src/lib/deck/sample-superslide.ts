import type { Deck } from "./schema";
import { themes } from "@/lib/themes";

/**
 * Self-pitch deck. Themed Vercel-style (dark) to demonstrate that any theme
 * works — the same Slide[] renders against any Theme.
 */
export const superslideSelfDeck: Deck = {
  id: "superslide-self",
  title: "Superslide",
  subtitle: "Upgrade your existing deck into an interactive web slideshow.",
  author: "Superslide Team",
  theme: themes.vercel,
  slides: [
    {
      id: "ss1",
      index: 0,
      kind: "title",
      eyebrow: "Slides, rebuilt",
      title: "Your PPTX wants to be a website.",
      subtitle:
        "Superslide takes the deck you already have and rebuilds it as a fully interactive, branded web slideshow — with shadcn, Three.js, and your brand's design system.",
    },
    {
      id: "ss2",
      index: 1,
      kind: "stats",
      title: "The deck-to-web tooling gap.",
      stats: [
        { value: "0", label: "tools render slides as a real React app today" },
        { value: "70M", label: "Gamma users want richer output than they get" },
        { value: "1 URL", label: "is all you paste — Superslide infers the brand" },
      ],
    },
  ],
};
