"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Deck } from "@/lib/deck/schema";
import { themeToCssVars } from "@/lib/themes/css";
import { SlideContent } from "./slide-kinds";
import { AmbientBackdrop } from "@/components/canvas/AmbientBackdrop";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Grid3x3,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

export function SlideRunner({ deck }: { deck: Deck }) {
  const [i, setI] = useState(0);
  const [overview, setOverview] = useState(false);
  const [fs, setFs] = useState(false);
  const total = deck.slides.length;
  const slide = deck.slides[i];
  const cssVars = useMemo(() => themeToCssVars(deck.theme), [deck.theme]);

  const next = useCallback(() => setI((p) => Math.min(total - 1, p + 1)), [total]);
  const prev = useCallback(() => setI((p) => Math.max(0, p - 1)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
        return;
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown" || e.key === "j") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "k") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        setI(0);
      } else if (e.key === "End") {
        setI(total - 1);
      } else if (e.key === "Escape") {
        setOverview(false);
      } else if (e.key === "o") {
        setOverview((o) => !o);
      } else if (e.key === "f") {
        toggleFs();
      } else if (/^[0-9]$/.test(e.key)) {
        const idx = Math.min(total - 1, Math.max(0, parseInt(e.key, 10) - 1));
        setI(idx);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, total]);

  function toggleFs() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFs(true);
    } else {
      document.exitFullscreen?.();
      setFs(false);
    }
  }

  return (
    <div
      style={cssVars as React.CSSProperties}
      className="relative flex h-screen w-screen flex-col bg-bg text-fg"
    >
      <AmbientBackdrop accent={deck.theme.colors.accent} />

      {/* Top chrome */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 text-sm text-fg-muted">
          <a href="/" className="font-semibold text-fg">superslide</a>
          <span className="opacity-40">·</span>
          <span className="truncate max-w-[36ch]">{deck.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOverview((o) => !o)}
            aria-label="Slide overview (o)"
            title="Overview (O)"
          >
            <Grid3x3 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFs}
            aria-label="Fullscreen (f)"
            title="Fullscreen (F)"
          >
            {fs ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
        </div>
      </header>

      {/* Stage */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            className="absolute inset-0"
          >
            <SlideContent slide={slide} theme={deck.theme} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom chrome: progress + nav */}
      <footer className="relative z-20 flex items-center justify-between gap-4 px-6 py-4">
        <Button variant="outline" size="icon" onClick={prev} disabled={i === 0} aria-label="Previous">
          <ArrowLeft size={18} />
        </Button>
        <div className="flex flex-1 items-center gap-3">
          <div className="font-mono text-xs text-fg-muted">
            {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>
          <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-fg/8">
            <motion.div
              className="absolute left-0 top-0 h-full bg-fg"
              animate={{ width: `${((i + 1) / total) * 100}%` }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            />
          </div>
          <div className="hidden font-mono text-[11px] uppercase tracking-widest text-fg-muted md:block">
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5">←</kbd>{" "}
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5">→</kbd>{" "}
            navigate · <kbd className="rounded border border-line bg-surface px-1.5 py-0.5">O</kbd>{" "}
            overview · <kbd className="rounded border border-line bg-surface px-1.5 py-0.5">F</kbd>{" "}
            full
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={next} disabled={i === total - 1} aria-label="Next">
          <ArrowRight size={18} />
        </Button>
      </footer>

      {/* Overview grid */}
      <AnimatePresence>
        {overview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col bg-bg/95 backdrop-blur-md"
          >
            <header className="flex items-center justify-between px-6 py-4">
              <div className="text-sm font-medium text-fg">Slides — {deck.title}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOverview(false)}
                aria-label="Close overview"
              >
                <X size={18} />
              </Button>
            </header>
            <div className="grid flex-1 grid-cols-2 gap-4 overflow-auto p-6 md:grid-cols-3 lg:grid-cols-4">
              {deck.slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setI(idx);
                    setOverview(false);
                  }}
                  className={`group relative flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-xl border p-4 text-left transition-all ${
                    i === idx
                      ? "border-fg bg-surface shadow-lift"
                      : "border-line bg-surface hover:border-line-strong hover:shadow-card"
                  }`}
                >
                  <span className="text-xs font-mono text-fg-muted">
                    {String(idx + 1).padStart(2, "0")} · {s.kind}
                  </span>
                  <span className="text-pretty text-sm font-medium leading-snug text-fg line-clamp-3">
                    {slideTitle(s)}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function slideTitle(s: Deck["slides"][number]): string {
  switch (s.kind) {
    case "title":
    case "bullets":
    case "stats":
    case "chart":
    case "comparison":
    case "timeline":
    case "hero3d":
    case "closing":
      return s.title ?? "";
    case "quote":
      return s.quote;
    case "code":
      return s.title ?? "code";
    case "image":
      return s.title ?? s.alt ?? "image";
  }
}
