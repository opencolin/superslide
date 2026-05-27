# Superslide

**Upgrade your existing slide deck into a fully interactive web slideshow — themed to your brand, animated with real web tech, deployable as a real Next.js app you own.**

You drop a PPTX, PDF, Keynote, or Markdown file. Within seconds you get a slideshow rendered as React + shadcn + Three.js, themed to a brand you choose (or one inferred from a URL). Present it, share a URL, or export the Next.js source.

## Why it exists

Every "AI presentation" tool either generates a deck from a prompt (commoditized — Tome shut down in 2025, MS Copilot ships this for free) or outputs `<div>`-based slides themed to one of five generic templates. Nobody takes the deck you already have and rebuilds it as a real interactive web app. Superslide does.

Full product context: [docs/PRD.md](docs/PRD.md).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) on Vercel Fluid Compute |
| Language | TypeScript, Tailwind v4 |
| UI | Hand-rolled shadcn-style primitives + Framer Motion |
| 3D | Raw three.js (R3F deferred — React 19 lifecycle quirks) |
| AI | Vercel AI Gateway (`anthropic/claude-haiku-4-5` default) |
| Parsing | `officeparser` (PPTX) · `unpdf` (PDF) |

## Routes

- `/` — marketing landing
- `/demo` — Cinder Builders Network showpiece deck (proves the wedge with a fictional GPU cloud)
- `/upload` — drop file → parse → theme → AI upgrade → present
- `/api/parse` — POST a file, get back canonical deck JSON
- `/api/upgrade` — POST raw deck JSON, get back upgraded deck (AI Gateway or heuristic)

## Local dev

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

For live AI upgrades, set `AI_GATEWAY_API_KEY` in `.env.local`. Without a key, the deck still upgrades via a rules-based heuristic — no signup needed to try it.

## Project layout

```
src/
  app/                      Next routes (landing, demo, upload, API)
  components/
    canvas/                 Raw three.js scenes (Hero3DScene, AmbientBackdrop)
    slides/                 Slide runner + 11 slide kinds
    landing/                Marketing page sections
    upload/                 4-step upload→present flow
    ui/                     shadcn-style primitives
  lib/
    deck/                   Zod schema · parsers · sample decks
    themes/                 5 built-in themes + CSS var bridge
    ai/                     AI Gateway upgrader + heuristic fallback
docs/PRD.md                 Product requirements
```

## Status

V0 wedge build — the technical proof. See [docs/PRD.md §10](docs/PRD.md) for the roadmap to V1 (persistence, brand-from-URL, presenter view) and V2 (deploy-to-Vercel export, theme editor).

## License

MIT. See [LICENSE](LICENSE).
