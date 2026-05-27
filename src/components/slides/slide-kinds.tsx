"use client";

import { motion } from "motion/react";
import type {
  Slide,
  Theme,
} from "@/lib/deck/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hero3DScene } from "@/components/canvas/Hero3DScene";
import { ArrowRight, Quote, Sparkles } from "lucide-react";

/* Slide animation primitives ---------------------------------------------- */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};
const fadeUp = {
  hidden: { y: 16 },
  show: { y: 0, transition: { duration: 0.5, ease: [0.2, 0.7, 0.2, 1] as const } },
};
const slideRight = {
  hidden: { x: -24 },
  show: { x: 0, transition: { duration: 0.5, ease: [0.2, 0.7, 0.2, 1] as const } },
};

/* Inline markdown -------------------------------------------------------- */
/* Render emphasis, code, and links from raw markdown text. Cheap regex-based
   tokenizer — we render slide BODIES, not whole documents, so this is plenty.
   Also strips leading H3+ heading markers (`### foo` → `foo`) so a markdown
   parser-leaked heading doesn't show as raw `###`. */

const INLINE_RE = /\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

function renderInline(text: string): React.ReactNode {
  const cleaned = text.replace(/^#{1,6}\s+/, "");
  const matches = Array.from(cleaned.matchAll(INLINE_RE));
  if (matches.length === 0) return cleaned;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  for (const m of matches) {
    const start = m.index ?? 0;
    if (start > lastIdx) parts.push(cleaned.slice(lastIdx, start));
    const key = `${start}-${m[0].length}`;
    if (m[1] !== undefined) {
      parts.push(<strong key={key} className="font-semibold">{m[1]}</strong>);
    } else if (m[2] !== undefined) {
      parts.push(<em key={key} className="italic">{m[2]}</em>);
    } else if (m[3] !== undefined) {
      parts.push(
        <code key={key} className="rounded bg-fg/10 px-1 py-0.5 font-mono text-[0.88em]">
          {m[3]}
        </code>,
      );
    } else if (m[4] !== undefined && m[5] !== undefined) {
      parts.push(
        <a
          key={key}
          href={m[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-accent-fg"
        >
          {m[4]}
        </a>,
      );
    }
    lastIdx = start + m[0].length;
  }
  if (lastIdx < cleaned.length) parts.push(cleaned.slice(lastIdx));
  return parts;
}

/* Shared slide chrome ----------------------------------------------------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <motion.div
      variants={fadeUp}
      className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted"
    >
      <span className="inline-block h-px w-8 bg-fg/40" />
      {children}
    </motion.div>
  );
}

function SlideHeading({
  children,
  size = "lg",
}: {
  children: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const cls =
    size === "xl"
      ? "text-[clamp(2.5rem,5.5vw,5.5rem)]"
      : size === "lg"
        ? "text-[clamp(2rem,4.25vw,4rem)]"
        : "text-[clamp(1.5rem,3vw,3rem)]";
  return (
    <motion.h1
      variants={fadeUp}
      className={`text-display font-semibold text-balance text-fg ${cls}`}
    >
      {children}
    </motion.h1>
  );
}

/* Kind: title ------------------------------------------------------------- */

export function TitleSlide({
  slide,
  theme,
}: {
  slide: Extract<Slide, { kind: "title" }>;
  theme: Theme;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative grid h-full w-full grid-cols-1 items-center px-[7vw] py-[6vh] lg:grid-cols-[1.4fr_1fr] lg:gap-12"
    >
      <div className="flex flex-col gap-7">
        <Eyebrow>{slide.eyebrow ?? "Superslide"}</Eyebrow>
        <SlideHeading size="xl">{slide.title}</SlideHeading>
        {slide.subtitle && (
          <motion.p
            variants={fadeUp}
            className="text-pretty text-lg leading-relaxed text-fg-muted max-w-[42ch] md:text-xl"
          >
            {slide.subtitle}
          </motion.p>
        )}
        {slide.by && (
          <motion.div variants={fadeUp} className="flex items-center gap-3 pt-3">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-sm text-fg-muted">{slide.by}</span>
          </motion.div>
        )}
      </div>
      <motion.div
        variants={fadeUp}
        className="relative hidden h-[60vh] items-center justify-center lg:flex"
      >
        <Hero3DScene scene="torus" accent={theme.colors.accent} />
      </motion.div>
    </motion.div>
  );
}

/* Kind: bullets ----------------------------------------------------------- */

export function BulletsSlide({
  slide,
}: {
  slide: Extract<Slide, { kind: "bullets" }>;
}) {
  // Density: tighten padding, gap, and font as bullet count climbs so 5–6
  // items still fit a single viewport without overflow.
  const n = slide.bullets.length;
  const dense = n >= 5;
  const med = n === 4;
  const itemPad = dense ? "p-3.5" : med ? "p-4" : "p-5";
  const listGap = dense ? "gap-2.5" : med ? "gap-3" : "gap-4";
  const textCls = dense
    ? "text-[15px] leading-snug"
    : med
      ? "text-base leading-snug md:text-lg"
      : "text-lg font-medium leading-snug md:text-xl";
  const hintCls = dense ? "text-xs leading-snug" : "text-sm leading-relaxed";

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid h-full w-full grid-cols-1 items-center gap-10 px-[7vw] py-[6vh] lg:grid-cols-[1fr_1.4fr] lg:gap-12"
    >
      <div className="flex flex-col gap-5">
        <Eyebrow>{slide.eyebrow ?? "Why"}</Eyebrow>
        <SlideHeading>{slide.title}</SlideHeading>
      </div>
      <motion.ul
        variants={stagger}
        className={`flex max-h-full flex-col overflow-y-auto scrollbar-hidden ${listGap}`}
      >
        {slide.bullets.map((b, i) => (
          <motion.li
            key={i}
            variants={slideRight}
            className={`group flex items-start gap-3 rounded-xl border border-line bg-surface/60 ${itemPad} transition-colors hover:border-line-strong hover:bg-surface`}
          >
            <span
              className={`flex flex-none items-center justify-center rounded-full bg-accent text-accent-fg font-semibold ${
                dense ? "mt-0.5 h-6 w-6 text-xs" : "mt-1 h-7 w-7 text-sm"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1 min-w-0">
              <span className={`font-medium text-fg ${textCls}`}>
                {renderInline(b.text)}
              </span>
              {b.hint && (
                <span className={`text-fg-muted ${hintCls}`}>{renderInline(b.hint)}</span>
              )}
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

/* Kind: quote ------------------------------------------------------------- */

export function QuoteSlide({
  slide,
}: {
  slide: Extract<Slide, { kind: "quote" }>;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex h-full w-full items-center justify-center px-[7vw] py-[6vh]"
    >
      <div className="flex max-w-4xl flex-col items-start gap-8">
        <motion.div variants={fadeUp} className="text-accent">
          <Quote size={56} strokeWidth={1.5} />
        </motion.div>
        <motion.blockquote
          variants={fadeUp}
          className="text-balance text-display text-[clamp(1.75rem,3.5vw,3.25rem)] font-medium leading-[1.15] text-fg"
        >
          “{slide.quote}”
        </motion.blockquote>
        {slide.attribution && (
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full bg-fg/10" />
            <div className="flex flex-col">
              <span className="font-medium text-fg">{slide.attribution}</span>
              {slide.role && (
                <span className="text-sm text-fg-muted">{slide.role}</span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* Kind: stats ------------------------------------------------------------- */

export function StatsSlide({
  slide,
}: {
  slide: Extract<Slide, { kind: "stats" }>;
}) {
  const cols = slide.stats.length;
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex h-full w-full flex-col justify-center gap-12 px-[7vw] py-[6vh]"
    >
      <div className="flex flex-col gap-5 max-w-3xl">
        {slide.eyebrow && <Eyebrow>{slide.eyebrow}</Eyebrow>}
        {slide.title && <SlideHeading size="md">{slide.title}</SlideHeading>}
      </div>
      <motion.div
        variants={stagger}
        className={`grid gap-6 ${
          cols === 4
            ? "grid-cols-2 md:grid-cols-4"
            : cols === 3
              ? "grid-cols-1 md:grid-cols-3"
              : cols === 2
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
        }`}
      >
        {slide.stats.map((s, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="rounded-2xl border border-line bg-surface p-7 transition-transform hover:-translate-y-1"
          >
            <div className="text-display text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-none text-fg">
              {s.value}
            </div>
            <div className="mt-4 h-px w-10 bg-accent" />
            <div className="mt-4 text-lg font-medium text-fg">{s.label}</div>
            {s.hint && (
              <div className="mt-1.5 text-sm text-fg-muted leading-relaxed">{s.hint}</div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* Kind: chart ------------------------------------------------------------- */

export function ChartSlide({
  slide,
  theme,
}: {
  slide: Extract<Slide, { kind: "chart" }>;
  theme: Theme;
}) {
  const max = Math.max(...slide.series.map((s) => s.value));
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid h-full w-full grid-cols-1 items-center gap-12 px-[7vw] py-[6vh] lg:grid-cols-[1fr_1.5fr]"
    >
      <div className="flex flex-col gap-5">
        <Eyebrow>Benchmark</Eyebrow>
        <SlideHeading>{slide.title}</SlideHeading>
        {slide.caption && (
          <motion.p variants={fadeUp} className="text-fg-muted leading-relaxed">
            {slide.caption}
          </motion.p>
        )}
      </div>
      <motion.div
        variants={stagger}
        className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-7"
      >
        {slide.series.map((s, i) => {
          const pct = (s.value / max) * 100;
          const accentBar = i === slide.series.length - 1;
          return (
            <motion.div key={i} variants={fadeUp} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-fg">{s.label}</span>
                <span className="font-mono text-fg-muted">{s.value.toLocaleString()}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-fg/8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
                  className="h-full rounded-full"
                  style={{ background: accentBar ? theme.colors.accent : theme.colors.fg }}
                />
              </div>
              {s.hint && <div className="text-xs text-fg-muted">{s.hint}</div>}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

/* Kind: code -------------------------------------------------------------- */

export function CodeSlide({
  slide,
}: {
  slide: Extract<Slide, { kind: "code" }>;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex h-full w-full flex-col justify-center gap-8 px-[7vw] py-[6vh]"
    >
      {slide.title && (
        <div className="flex flex-col gap-3 max-w-3xl">
          <Eyebrow>Example</Eyebrow>
          <SlideHeading size="md">{slide.title}</SlideHeading>
        </div>
      )}
      <motion.pre
        variants={fadeUp}
        className="overflow-x-auto rounded-2xl border border-line bg-elevated p-7 text-sm leading-relaxed shadow-card scrollbar-hidden"
      >
        <div className="mb-4 flex items-center gap-2 text-xs text-fg-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-fg/15" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-fg/15" />
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-fg/15" />
          <span className="ml-2 font-mono">{slide.language}</span>
        </div>
        <code className="font-mono text-fg whitespace-pre">{slide.code}</code>
      </motion.pre>
      {slide.caption && (
        <motion.div variants={fadeUp} className="text-sm text-fg-muted">
          {slide.caption}
        </motion.div>
      )}
    </motion.div>
  );
}

/* Kind: comparison -------------------------------------------------------- */

export function ComparisonSlide({
  slide,
}: {
  slide: Extract<Slide, { kind: "comparison" }>;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex h-full w-full flex-col justify-center gap-10 px-[7vw] py-[6vh]"
    >
      <div className="max-w-3xl">
        <Eyebrow>Compare</Eyebrow>
        <SlideHeading size="md">{slide.title}</SlideHeading>
      </div>
      <motion.div variants={stagger} className="grid gap-6 md:grid-cols-2">
        {([slide.left, slide.right] as const).map((side, i) => (
          <motion.div
            key={i}
            variants={i === 0 ? slideRight : fadeUp}
            className={`relative flex flex-col gap-4 rounded-2xl border p-7 ${
              side.tone === "accent"
                ? "border-fg bg-accent text-accent-fg"
                : "border-line bg-surface"
            }`}
          >
            <div className="flex items-center justify-between">
              <Badge
                variant={side.tone === "accent" ? "default" : "outline"}
                className={
                  side.tone === "accent" ? "bg-accent-fg text-accent" : undefined
                }
              >
                {side.label}
              </Badge>
              {side.tone === "accent" && (
                <Sparkles size={20} className="text-accent-fg" />
              )}
            </div>
            <ul className="flex flex-col gap-3">
              {side.points.map((p, j) => (
                <li key={j} className="flex items-start gap-3 text-[15px] leading-relaxed">
                  <span
                    className={`mt-2 inline-block h-1.5 w-1.5 flex-none rounded-full ${
                      side.tone === "accent" ? "bg-accent-fg" : "bg-fg/40"
                    }`}
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* Kind: timeline ---------------------------------------------------------- */

export function TimelineSlide({
  slide,
}: {
  slide: Extract<Slide, { kind: "timeline" }>;
}) {
  // Dynamic column count so 5 steps stay in one row at lg+ instead of
  // wrapping to a second row that overflows the viewport. Cap at 6 for
  // readability; the schema already caps at 5.
  const n = slide.steps.length;
  // Strings kept literal so Tailwind's source scanner picks them up.
  const lgCols =
    n >= 6
      ? "lg:grid-cols-6"
      : n === 5
        ? "lg:grid-cols-5"
        : n === 3
          ? "lg:grid-cols-3"
          : n === 2
            ? "lg:grid-cols-2"
            : "lg:grid-cols-4";
  const itemPad = n >= 5 ? "p-4" : "p-5";

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex h-full w-full flex-col justify-center gap-10 px-[7vw] py-[6vh]"
    >
      <div className="max-w-3xl">
        <Eyebrow>Flow</Eyebrow>
        <SlideHeading size="md">{slide.title}</SlideHeading>
      </div>
      <motion.ol
        variants={stagger}
        className={`grid gap-4 grid-cols-2 ${lgCols}`}
      >
        {slide.steps.map((step, i) => (
          <motion.li
            key={i}
            variants={fadeUp}
            className={`relative flex flex-col gap-3 rounded-2xl border border-line bg-surface ${itemPad}`}
          >
            <span className="text-xs font-mono uppercase tracking-widest text-fg-muted">
              {step.when ?? `Step ${i + 1}`}
            </span>
            <span className="text-base font-semibold leading-snug text-fg">
              {renderInline(step.label)}
            </span>
            {step.body && (
              <span className="text-sm leading-relaxed text-fg-muted">
                {renderInline(step.body)}
              </span>
            )}
            {i < n - 1 && (
              <span className="absolute right-[-12px] top-1/2 hidden -translate-y-1/2 text-accent lg:block">
                <ArrowRight size={20} />
              </span>
            )}
          </motion.li>
        ))}
      </motion.ol>
    </motion.div>
  );
}

/* Kind: image ------------------------------------------------------------- */

export function ImageSlide({
  slide,
}: {
  slide: Extract<Slide, { kind: "image" }>;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex h-full w-full flex-col justify-center gap-6 px-[7vw] py-[6vh]"
    >
      {slide.title && (
        <SlideHeading size="md">{slide.title}</SlideHeading>
      )}
      <motion.div
        variants={fadeUp}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-line bg-elevated"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.src}
          alt={slide.alt ?? ""}
          className="h-full w-full object-cover"
        />
      </motion.div>
      {slide.caption && (
        <motion.div variants={fadeUp} className="text-sm text-fg-muted">
          {slide.caption}
        </motion.div>
      )}
    </motion.div>
  );
}

/* Kind: hero3d ------------------------------------------------------------ */

export function Hero3DSlide({
  slide,
  theme,
}: {
  slide: Extract<Slide, { kind: "hero3d" }>;
  theme: Theme;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative grid h-full w-full grid-cols-1 items-center px-[7vw] py-[6vh] lg:grid-cols-[1fr_1.1fr] lg:gap-12"
    >
      <div className="relative z-10 flex flex-col gap-7">
        <Eyebrow>Reveal</Eyebrow>
        <SlideHeading size="xl">{slide.title}</SlideHeading>
        {slide.subtitle && (
          <motion.p
            variants={fadeUp}
            className="max-w-[42ch] text-lg leading-relaxed text-fg-muted md:text-xl"
          >
            {slide.subtitle}
          </motion.p>
        )}
        {slide.cta && (
          <motion.div variants={fadeUp}>
            <Button variant="accent" size="lg">
              {slide.cta} <ArrowRight size={18} />
            </Button>
          </motion.div>
        )}
      </div>
      <motion.div
        variants={fadeUp}
        className="relative h-[55vh] w-full"
      >
        <Hero3DScene scene={slide.scene} accent={theme.colors.accent} />
      </motion.div>
    </motion.div>
  );
}

/* Kind: closing ----------------------------------------------------------- */

export function ClosingSlide({
  slide,
}: {
  slide: Extract<Slide, { kind: "closing" }>;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex h-full w-full flex-col items-center justify-center gap-8 px-[7vw] py-[6vh] text-center"
    >
      <motion.div variants={fadeUp} className="accent-rule h-px w-32" />
      <SlideHeading size="xl">{slide.title}</SlideHeading>
      {slide.subtitle && (
        <motion.p
          variants={fadeUp}
          className="max-w-[48ch] text-pretty text-lg leading-relaxed text-fg-muted md:text-xl"
        >
          {slide.subtitle}
        </motion.p>
      )}
      {slide.cta && (
        <motion.div variants={fadeUp}>
          <Button variant="accent" size="lg" asChild={false}>
            {slide.ctaHref ? (
              <a href={slide.ctaHref} className="contents">
                {slide.cta} <ArrowRight size={18} />
              </a>
            ) : (
              <>
                {slide.cta} <ArrowRight size={18} />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

/* Dispatcher -------------------------------------------------------------- */

export function SlideContent({ slide, theme }: { slide: Slide; theme: Theme }) {
  switch (slide.kind) {
    case "title":
      return <TitleSlide slide={slide} theme={theme} />;
    case "bullets":
      return <BulletsSlide slide={slide} />;
    case "quote":
      return <QuoteSlide slide={slide} />;
    case "stats":
      return <StatsSlide slide={slide} />;
    case "chart":
      return <ChartSlide slide={slide} theme={theme} />;
    case "code":
      return <CodeSlide slide={slide} />;
    case "comparison":
      return <ComparisonSlide slide={slide} />;
    case "timeline":
      return <TimelineSlide slide={slide} />;
    case "image":
      return <ImageSlide slide={slide} />;
    case "hero3d":
      return <Hero3DSlide slide={slide} theme={theme} />;
    case "closing":
      return <ClosingSlide slide={slide} />;
  }
}
