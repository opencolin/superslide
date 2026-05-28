# Superslide — Product Requirements Document

**Version:** 0.1 (post-V0 wedge build)
**Author:** Colin
**Last updated:** 2026-05-26
**Status:** Draft, owners TBD

---

## 1. One-liner

**Superslide turns the deck you already have into a fully interactive web slideshow — themed to your brand, animated with real web tech, deployable as a real Next.js app you own.**

You drop a PPTX, PDF, or Keynote. Within seconds you get a slideshow rendered as React + shadcn + Three.js, themed to match a brand of your choice. You can present it, share a URL, embed it, or export the source.

---

## 2. Why now

The "AI generates a deck from a prompt" market is rapidly commoditizing. Microsoft Copilot, Google Gemini, and ChatGPT all ship some version of it for free or bundled. **Tome shut down its consumer presentation product in March 2025** as direct confirmation that the prompt-to-deck wedge alone is not defensible.

But the **adjacent** market — "the deck I already have is ugly, generic, or doesn't reflect my brand" — is wide open. Live competitive research (May 2026) confirms:

- **No competitor renders presentations as a real React/Three.js app.** All current "web-native" decks (Gamma, Pitch, Beautiful.ai, Visme) output HTML divs that mimic slides, or static PPTX. Two adjacent tools (SEELE AI, Rosebud) do AI → Three.js but for games and websites, not decks.
- **Brand-from-a-URL is marketed by exactly one player** (Presentations.AI's "Brand Sync"), and the output is still PPTX-first.
- **No competitor produces a deployable Next.js website the user owns.** Every share link routes through the vendor's viewer; export to PPTX is broken across the board (Gamma's exports "shift text boxes mid-presentation" per recent reviews).
- **PPTX-in / fidelity-preserving-web-out is an empty quadrant.** Most tools generate from scratch; the few that import (Gamma, SlideSpeak, Plus AI, LLeMental) treat the import as lossy text extraction.

Superslide sits squarely in the intersection of these four gaps. The V0 build (shipped) proves the technical wedge works.

---

## 3. Target users

### Primary: AI / Developer-Relations Engineer ("Devon")

Ships product launch decks weekly for tweets, conference talks, and customer demos. Already comfortable with Next.js and Tailwind. Hates that the company's brand kit doesn't translate into PowerPoint. Will pay personally for tools that make their work look ten times sharper. **North-star customer.**

### Secondary: Seed-stage Founder ("Anya")

Pitches investors monthly, wants the deck to feel like the product, not like a template. Doesn't write code but understands "your homepage" as a brand source. Strong word-of-mouth channel — pitches get screenshared between investors.

### Tertiary: B2B Marketing Manager ("Priya")

Needs the entire team's launch decks to feel like the website. Cares about brand governance, shared themes, and embedding decks in product launch pages. Buys on behalf of the team.

We explicitly de-prioritize: students, casual users making birthday slideshows, and PowerPoint-first enterprises with no brand site.

---

## 4. Goals & non-goals

### Goals
- A user can convert an existing deck (PPTX/PDF/Keynote) to a richer, branded, interactive web slideshow in **under 60 seconds** with no design work.
- The output **always looks better than the source**, regardless of source quality.
- Themes are **JSON-portable**: switching brands is a one-prop change.
- The artifact is a **real Next.js app**, exportable to the user's GitHub and deployable to Vercel in one click.
- Existing decks should be **the primary input** — generation-from-prompt is a secondary path.

### Non-goals (V0–V2)
- Round-trip fidelity to PPTX. We do not produce a .pptx export. Editing happens in the web slideshow.
- Generic AI-from-prompt deck generation. We will support a "from prompt" entry point eventually, but it is not what differentiates us.
- Real-time collaborative editing (Google-Slides-style). V3+.
- Mobile-first authoring. Authoring is desktop-first; viewing is responsive.
- Native PowerPoint integration / add-in. We are intentionally outside the Microsoft / Google office ecosystem.

---

## 5. Success metrics

| Metric | V0 (Beta) | V1 (Public) | V2 (PMF) |
|---|---|---|---|
| Time from upload to first slide | < 15s | < 10s | < 8s |
| Time to fully upgraded deck (10 slides) | < 30s | < 20s | < 15s |
| % of upgraded slides users present without editing | n/a | > 50% | > 75% |
| Weekly active creators | 100 | 2k | 25k |
| Decks shared via public URL | 50/wk | 1k/wk | 20k/wk |
| Free → Pro conversion | n/a | > 3% | > 7% |
| NPS from primary persona (Devon) | n/a | > 40 | > 60 |

**Quality bar (qualitative):** a Devon-class user pastes their homepage URL, drops yesterday's PPTX, and the output is share-ready without manual edits 75% of the time.

---

## 6. User flows

### Flow A — Upgrade an existing deck (primary)

1. Land on `/` → click **Upload your deck**
2. Drag-drop a PPTX/PDF/Keynote (or paste a Google Slides / Notion URL — V1)
3. **Parse** runs server-side. User sees a 4-step stepper (Upload → Review → Upgrade → Present).
4. **Review:** preview cards of raw slides, choose a theme from the gallery or paste a URL to derive one (V1).
5. **Upgrade:** AI classifies each slide kind in parallel, rewrites copy to be punchier, picks layouts.
6. **Present:** keyboard-first slideshow opens. Share/embed/export menu in the chrome.

### Flow B — Share or embed a deck

1. From any deck, click **Share** → get a public URL with optional password.
2. Toggle **Embed** → get an `<iframe>` snippet sized to a 16:9 container.
3. Optional: enable **comments** so viewers can leave inline reactions (V2).

### Flow C — Deploy as your own Next.js app

1. From any deck, click **Export → Vercel**.
2. OAuth into GitHub, create a new repo, deploy to Vercel.
3. Deck now lives at `your-domain.com/talks/launch-q3`, source in user's repo, all customizations free-game.

### Flow D — Generate a brand theme from a URL

1. From the theme picker, click **Use brand from URL**.
2. Paste `acme.com`.
3. Superslide crawls the page, extracts: primary/secondary/accent palette, typeface stack, radius scale, motion language hints.
4. Returns a theme JSON, previewed live on the current deck.
5. Save to user's theme library.

---

## 7. Functional requirements

### 7.1 Deck ingest (parser)
- Support inputs: `.pptx`, `.ppt`, `.pdf`, `.key`, `.odp`, `.md`/`.markdown`/`.mdx`. Max 50MB at V0, 200MB at V1.
- Markdown convention follows Reveal.js / Marp / Slidev: `---` separates slides, first `#` becomes the title, fenced code blocks collapse to a single text entry, YAML frontmatter sets deck-level metadata, `<!-- notes: ... -->` extracts speaker notes.
- Extract per slide: title, body text (preserving bullet structure), speaker notes, image references, slide-level metadata.
- V1: extract embedded images, charts (as data), tables, basic formatting (bold/italic/color hints).
- V1: import from URL — Google Slides, Notion, Loom embed, public Gamma deck.
- V2: import from screenshot (computer-vision parse of a single slide image).

### 7.2 AI slide upgrader
- Per-slide classification into one of N kinds (currently 11): `title | bullets | quote | code | stats | comparison | timeline | image | chart | hero3d | closing`.
- Each kind has a typed schema; the upgrader emits a structured object validated against it.
- Rewriting rules baked into the system prompt: shorter than the source, no inventing facts, winning-side-gets-accent on comparisons.
- Provider routing through **Vercel AI Gateway** with `anthropic/claude-haiku-4-5` as default, automatic fallback to `bedrock` and `vertexAnthropic`. Surcharge cost ~$0.0001 per slide.
- Heuristic fallback (rules-based) for offline / no-key scenarios. Per-slide fallback if any one call errors.
- V1: streaming UI (each slide pops in as the upgrader finishes it).
- V1: AI "rewrite this slide" affordance in the editor.
- V2: AI-generated supplementary slides ("insert a comparison slide here").

### 7.3 Theme system
- **Theme = JSON.** Schema: `colors` (10 keys), `fonts` (3 keys), `radius` (3 enum), `vibe` (6 enum).
- Five built-in themes at V0: Neon (light + dark), Vercel, Arctic, Oxide.
- Themes are 100% decoupled from content. Same `Slide[]` renders against any theme.
- V1: **brand-from-URL** generator (see Flow D).
- V1: **theme editor** — visual color picker + font dropdown + live preview.
- V2: theme marketplace; community-published themes; per-team theme library.

### 7.4 Renderer / presentation runtime
- Keyboard nav: `←/→/space/PgUp/PgDn/j/k/Home/End`, `0–9` jump, `O` overview grid, `F` fullscreen, `Esc` exit overlays.
- Motion-driven transitions between slides; per-slide staggered entrance (bullets reveal in sequence, charts animate from zero).
- Three.js hero scenes (5 styles) rendered with raw three.js to keep the runtime independent of R3F lifecycle issues we hit at V0.
- Ambient particle backdrop, lime accent threading through all slides.
- V1: **presenter view** (dual screen, speaker notes, next-slide preview, timer, click-to-advance from any keyboard).
- V1: **fragment reveals** within a slide (bullets that step through on space).
- V1: **draw / annotate** mode for live presentations.
- V2: **timer-driven autoplay** for kiosk / lobby decks.
- **Narration ("podcast mode")** — ElevenLabs TTS reads each slide's speaker notes (or composed script from slide content) and auto-advances on `ended`. Server resolves the API key in this order: per-request `x-elevenlabs-key` header (BYOK) → `ELEVENLABS_API_KEY` env (shared). When the shared key returns `quota_exceeded` or `invalid_api_key`, the API returns 402 with `{ source: "shared" }` so the viewer can prompt the user to paste their own key. The user's key lives only in `localStorage` and is forwarded on per-request narration calls.

### 7.5 Hosting and sharing
- Every saved deck lives at a stable URL: `superslide.app/d/<slug>` or under a custom domain.
- Public, password-protected, or unlisted.
- Open-graph preview image: a snapshot of the title slide.
- Embed: `<iframe>` with the same viewer chrome, optional `autoplay` / `loop` params.
- V1: deck **versions** with rollback; one deck can have multiple themes side-by-side.
- V2: **comments** anchored to slides; **reactions** during presentation; analytics (views, watch time).

### 7.6 Export
- V0: **none** — the deck is hosted by us.
- V1: **PDF export** via puppeteer (rasterized; loses interactivity but faithful to layout).
- V1: **Export to Vercel** — generates a Next.js repo on the user's GitHub and deploys.
- V2: **Markdown source export** (deck → `.deck.md` round-trippable format for git diffability).

### 7.7 Auth and persistence
- V0: no auth. Decks live in client state only.
- V1: **Sign in with Vercel** (OAuth, no signup form) + optional GitHub. Decks persist in a per-user library.
- V2: Teams, shared theme library, role-based access (viewer / editor / admin).
- Enterprise: SSO (SAML/OIDC), audit logs, custom domain on demand.

### 7.8 Programmatic API (V2+)
- REST + MCP server for deck creation, theme management, and rendering.
- Use cases: CI-driven release decks, autogenerated weekly metrics decks, AI agent workflows.

---

## 8. Non-functional requirements

- **Performance:** initial slideshow first-contentful-paint < 1.5s on a 4G connection. R3F hero scenes graceful-degrade on low-end devices (CSS-only fallback animation).
- **Accessibility:** all slides must render readable without JS (semantic HTML behind the renderer). Keyboard nav covers every action. Color contrast meets WCAG AA on every built-in theme.
- **Mobile:** viewer must be usable on phones (responsive font scaling, tap-zone navigation). Authoring is desktop-first; we explicitly defer mobile authoring.
- **Internationalization:** copy in title/bullets must support non-Latin scripts. Fonts in built-in themes must have wide language coverage (Inter, Geist).
- **Security:** uploaded files parsed in a sandboxed runtime; no eval of slide content; user-supplied URLs (brand-from-URL) crawled through a request proxy with an allowlisted user-agent.
- **Privacy:** uploaded decks are not used to train models. Vercel AI Gateway is configured for zero data retention.

---

## 9. Architecture summary

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) on Vercel Fluid Compute |
| Language | TypeScript |
| UI | shadcn-style hand-rolled primitives + Tailwind v4 + Framer Motion |
| 3D | raw three.js (R3F deferred due to React 19 lifecycle issues seen at V0) |
| AI | Vercel AI Gateway, `anthropic/claude-haiku-4-5` default |
| Storage | V0: client only. V1: Vercel Blob (file uploads) + Postgres on Marketplace (deck metadata) |
| Auth | V1: Sign in with Vercel |
| File parsing | `officeparser` (PPTX), `unpdf` (PDF), Apple ZIP unpack (Keynote) — all server-side Node runtime |
| Telemetry | Vercel Analytics + Speed Insights |
| CI/CD | Vercel preview per PR; rolling releases on production promote |

Single repo, no microservices in V0–V2. All state lives in the user's session and a small Postgres in V1+.

---

## 10. Phased roadmap

### V0 — Wedge build (shipped)
Marketing landing, upload flow, parser, AI Gateway upgrader, 5 themes, slide renderer with 11 kinds, Cinder Builders showpiece demo. Built in one day.

### V1 — Public beta (target: 6 weeks)
- Persistence (Postgres + Blob)
- Sign in with Vercel
- Shareable URLs with OG snapshots
- Brand-from-URL generator
- Streaming upgrade UX
- Presenter view
- PDF export
- Image extraction from PPTX
- Embed mode
- 10 additional built-in themes
- Speed insights + analytics

### V2 — PMF push (target: 12 weeks)
- Export to Vercel (real repo, real deploy)
- Theme editor (visual)
- Comments + reactions on shared decks
- Deck analytics dashboard
- Template gallery
- Markdown source export
- Custom domain support

### V3 — Platform (target: 6 months)
- Real-time collaboration (Liveblocks or Yjs)
- Programmatic API + MCP server
- Theme marketplace
- AI rewriting / insert / restructure
- Enterprise tier (SSO, audit, BYOK gateway)

---

## 11. Business model

**Pricing tiers (proposed):**

| Tier | Price | What's included |
|---|---|---|
| Free | $0 | 3 decks · 100 AI-upgraded slides/mo · superslide.app subdomain · public-only |
| Pro | $19 / mo | Unlimited decks · 2,000 AI slides/mo · 10 custom themes · PDF export · password-protected sharing |
| Team | $49 / user / mo | Brand-from-URL · shared theme library · analytics · 10k AI slides/user · custom domain |
| Enterprise | from $2k / mo | SSO · audit logs · zero-DR contract · BYOK gateway · dedicated subdomain |

**Pricing rationale:** Gamma's Pro is $15–20; Beautiful.ai $12–45; Presentations.AI $198/yr. Pro at $19 is in the comfortable middle; Team at $49 captures the team-multiplier value of brand-from-URL and shared themes.

**Cost guardrails:** per-slide AI cost is ~$0.0001 at Haiku rates. A Pro user maxing out 2,000 slides costs us ≈$0.20/mo in inference. The 50× margin is intentional — leaves room for model upgrades, image generation in upgraded slides, and richer system prompts.

**Acquisition channel:** open-source the slide renderer + theme system on GitHub. Devon-class users find us by reading the source. The hosted product is the upsell.

---

## 12. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Gamma adds Three.js scenes and brand-from-URL | High | Move first on deploy-to-Vercel + open-source the renderer; lock in devs as the channel |
| AI cost spikes (model price increase) | Medium | Per-account daily budget caps; fallback to heuristic if budget exceeded; gateway routing to cheapest provider |
| PPTX edge cases (tables, embedded charts, custom fonts) | Medium | Lossy is OK at V0 (rebuild as our kinds); V2 add table + chart parsers; never claim "100% fidelity" |
| Three.js perf on low-end mobile | Medium | Detect WebGL2 + device class; CSS-only fallback animation per kind |
| AI hallucinations changing facts | Medium | System prompt: "do not invent facts, only restructure." User can revert any slide to heuristic upgrade in one click |
| Tome shutdown signals zero TAM | Low | Tome priced/positioned as consumer prompt-to-deck (commoditized); we are dev-tool / pro-creator (defensible) |
| User uploads sensitive deck → AI Gateway logs | Medium | Gateway zero-data-retention enforced; document this on the upload page; offer BYOK on Enterprise |

---

## 13. Open questions

1. **Should brand-from-URL ship in V0.5 instead of V1?** It is the strongest differentiator and the V0 build can support it within ~2 weeks. Tradeoff: pushes persistence and presenter view back.
2. **Open-source the renderer + theme system under MIT?** Yes-leaning: gives Devon-personas a reason to evangelize. Risk: a competitor forks the renderer. Mitigation: keep the AI upgrader and theme generator proprietary.
3. **Do we own the editor UI or just the runtime?** V0 has no editor. V1 needs at least slide reordering, kind override, text edit. The decision is whether we build a full WYSIWYG (slow) or a CodeMirror-style structured editor (fast, dev-aligned).
4. **Custom domains via Vercel for Platforms?** Likely yes for Team and Enterprise. Pricing impact: adds an infra line item.
5. **Mobile authoring — really never?** Probably never for primary persona, but the "fix one bullet from my phone" case might be worth a minimal mobile editor in V3.
6. **How do we handle Keynote files cross-platform?** `officeparser` handles `.key` weakly. Apple does not document the format. Acceptable to recommend "export to PPTX first" for V0/V1.

---

## 14. Appendix — competitor matrix (live data, May 2026)

| Tool | Existing deck input | Web output | 3D / WebGL | Brand-from-URL | Deployable | Pricing |
|---|---|---|---|---|---|---|
| **Superslide** | yes | real Next.js | yes | yes (V1) | yes (V2) | $0–$2k |
| Gamma | partial (lossy) | web cards | no | partial | no | $0–$90 |
| Presentations.AI | yes | viewer only | no | **yes** | no | $198/yr |
| Pitch | no | viewer only | no | no | no | $0–$85 |
| Beautiful.ai | no | viewer only | no | no | no | $12–$45 |
| Plus AI | yes (GSlides) | inside GSlides | no | no | no | $10–$20 |
| Visme | yes | viewer only | no | no | no | $12–$25 |
| MS Copilot in PPT | yes | PPT only | no | no | no | bundled |
| Tome | **defunct** | — | — | — | — | — |
| ChatBA | **defunct** | — | — | — | — | — |

---

*This document is a living draft. Comments via PR or Linear ticket #SUP-001.*
