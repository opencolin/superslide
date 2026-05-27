"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { themes } from "@/lib/themes";
import { SlideRunner } from "@/components/slides/SlideRunner";
import type { Deck, RawDeck } from "@/lib/deck/schema";
import { Check, FileText, Loader2, Sparkles, Upload, X } from "lucide-react";

type Stage = "idle" | "parsing" | "review" | "upgrading" | "ready" | "presenting" | "error";

export function UploadFlow() {
  const [stage, setStage] = useState<Stage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [raw, setRaw] = useState<RawDeck | null>(null);
  const [themeId, setThemeId] = useState<string>("neon");
  const [deck, setDeck] = useState<Deck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setStage("parsing");
    const form = new FormData();
    form.append("file", f);
    const res = await fetch("/api/parse", { method: "POST", body: form });
    if (!res.ok) {
      setError((await res.json()).error ?? "Failed to parse");
      setStage("error");
      return;
    }
    const r = (await res.json()) as RawDeck;
    setRaw(r);
    setStage("review");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/pdf": [".pdf"],
      "application/vnd.apple.keynote": [".key"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  async function upgrade() {
    if (!raw) return;
    setStage("upgrading");
    setError(null);
    const res = await fetch("/api/upgrade", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ raw, themeId }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Failed to upgrade");
      setStage("error");
      return;
    }
    const d = (await res.json()) as Deck;
    setDeck(d);
    setStage("ready");
  }

  function reset() {
    setStage("idle");
    setFile(null);
    setRaw(null);
    setDeck(null);
    setError(null);
  }

  if (stage === "presenting" && deck) {
    return (
      <div className="fixed inset-0 z-50 bg-bg">
        <SlideRunner deck={deck} />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 pb-24 pt-12">
      <div className="mb-10 flex flex-col items-start gap-4">
        <Badge variant="outline" className="border-fg/15">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Beta · free while building
        </Badge>
        <h1 className="text-display text-balance text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.05]">
          Upload your deck.
        </h1>
        <p className="max-w-xl text-pretty text-base leading-relaxed text-fg-muted md:text-lg">
          PPTX, PDF, or Keynote (under 50MB). We parse it locally, the AI
          upgrades it, you pick the brand.
        </p>
      </div>

      {/* Stepper */}
      <Stepper stage={stage} />

      <div className="mt-10 grid gap-8">
        {stage === "idle" && (
          <div
            {...getRootProps()}
            className={`group cursor-pointer rounded-2xl border-2 border-dashed bg-surface px-8 py-20 text-center transition-all ${
              isDragActive
                ? "border-fg bg-accent/30"
                : "border-line hover:border-fg/30 hover:bg-elevated"
            }`}
          >
            <input {...getInputProps()} />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fg/8 text-fg group-hover:bg-accent group-hover:text-accent-fg transition-colors">
              <Upload size={22} />
            </div>
            <p className="mt-5 text-lg font-medium text-fg">
              {isDragActive ? "Drop it." : "Drag a deck here, or click to browse."}
            </p>
            <p className="mt-2 text-sm text-fg-muted">
              .pptx · .ppt · .pdf · .key · max 50MB
            </p>
          </div>
        )}

        <AnimatePresence>
          {stage === "parsing" && (
            <BusyCard label="Parsing your deck…" hint={`Reading ${file?.name ?? ""}`} />
          )}
        </AnimatePresence>

        {stage === "review" && raw && (
          <ReviewStep raw={raw} themeId={themeId} setThemeId={setThemeId} onUpgrade={upgrade} onReset={reset} />
        )}

        <AnimatePresence>
          {stage === "upgrading" && (
            <BusyCard
              label="Rebuilding your deck…"
              hint="Classifying slide intents, picking layouts, animating components."
            />
          )}
        </AnimatePresence>

        {stage === "ready" && deck && (
          <ReadyStep deck={deck} onPresent={() => setStage("presenting")} onReset={reset} />
        )}

        {stage === "error" && (
          <Card className="border-rose-300 bg-rose-50 p-6 text-sm">
            <div className="flex items-center gap-3">
              <X size={18} className="text-rose-700" />
              <div>
                <div className="font-medium text-rose-900">Something went wrong</div>
                <div className="text-rose-700">{error}</div>
              </div>
              <Button variant="outline" size="sm" onClick={reset} className="ml-auto">
                Try again
              </Button>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}

function Stepper({ stage }: { stage: Stage }) {
  const steps = ["Upload", "Review", "Upgrade", "Present"];
  const idx =
    stage === "idle"
      ? 0
      : stage === "parsing" || stage === "review"
        ? 1
        : stage === "upgrading"
          ? 2
          : stage === "ready" || stage === "presenting"
            ? 3
            : 0;
  return (
    <ol className="flex items-center gap-3 text-xs font-medium uppercase tracking-widest">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-3">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full border ${
              i < idx
                ? "border-fg bg-fg text-bg"
                : i === idx
                  ? "border-fg bg-accent text-accent-fg"
                  : "border-line bg-surface text-fg-muted"
            }`}
          >
            {i < idx ? <Check size={12} /> : i + 1}
          </span>
          <span className={i <= idx ? "text-fg" : "text-fg-subtle"}>{s}</span>
          {i < steps.length - 1 && (
            <span className="ml-1 h-px w-8 bg-line" />
          )}
        </li>
      ))}
    </ol>
  );
}

function BusyCard({ label, hint }: { label: string; hint: string }) {
  return (
    <motion.div
      initial={{ y: 8 }}
      animate={{ y: 0 }}
      exit={{ opacity: 0 }}
    >
      <Card className="flex items-center gap-4 p-7">
        <Loader2 size={22} className="animate-spin text-fg" />
        <div>
          <div className="text-base font-medium text-fg">{label}</div>
          <div className="text-sm text-fg-muted">{hint}</div>
        </div>
      </Card>
    </motion.div>
  );
}

function ReviewStep({
  raw,
  themeId,
  setThemeId,
  onUpgrade,
  onReset,
}: {
  raw: RawDeck;
  themeId: string;
  setThemeId: (id: string) => void;
  onUpgrade: () => void;
  onReset: () => void;
}) {
  return (
    <motion.div initial={{ y: 8 }} animate={{ y: 0 }}>
      <Card className="overflow-hidden">
        <div className="border-b border-line bg-elevated p-6">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-fg-muted" />
            <div>
              <div className="text-base font-semibold text-fg">{raw.title}</div>
              <div className="text-sm text-fg-muted">
                {raw.slides.length} slides parsed · source: {raw.source}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
              Start over
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3 md:grid-cols-4">
          {raw.slides.slice(0, 8).map((s) => (
            <div
              key={s.id}
              className="aspect-[4/3] rounded-lg border border-line bg-surface p-3 text-xs"
            >
              <div className="font-mono text-fg-subtle">
                {String(s.index + 1).padStart(2, "0")}
              </div>
              <div className="mt-1.5 line-clamp-2 font-semibold text-fg">
                {s.title ?? <span className="italic text-fg-muted">no title</span>}
              </div>
              <div className="mt-1.5 line-clamp-3 text-fg-muted">
                {s.text.slice(0, 3).join(" · ")}
              </div>
            </div>
          ))}
          {raw.slides.length > 8 && (
            <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-line text-xs text-fg-muted">
              + {raw.slides.length - 8} more
            </div>
          )}
        </div>
        <div className="border-t border-line p-6">
          <div className="mb-3 text-xs font-medium uppercase tracking-widest text-fg-muted">
            Pick a theme
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(themes).map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all ${
                  themeId === t.id
                    ? "border-fg bg-fg text-bg"
                    : "border-line bg-surface text-fg hover:border-line-strong"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full border"
                  style={{ background: t.colors.accent, borderColor: t.colors.fg }}
                />
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-line bg-elevated p-6">
          <Button variant="ghost" onClick={onReset}>Cancel</Button>
          <Button variant="primary" onClick={onUpgrade}>
            <Sparkles size={16} /> Upgrade this deck
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function ReadyStep({
  deck,
  onPresent,
  onReset,
}: {
  deck: Deck;
  onPresent: () => void;
  onReset: () => void;
}) {
  return (
    <motion.div initial={{ y: 8 }} animate={{ y: 0 }}>
      <Card className="overflow-hidden">
        <div className="border-b border-line bg-elevated p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-fg">
              <Check size={16} strokeWidth={2.5} />
            </span>
            <div>
              <div className="text-base font-semibold text-fg">{deck.title}</div>
              <div className="text-sm text-fg-muted">
                {deck.slides.length} slides · themed in {deck.theme.name}
              </div>
            </div>
            <Button variant="primary" size="md" onClick={onPresent} className="ml-auto">
              Present
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3 md:grid-cols-4">
          {deck.slides.map((s, i) => (
            <div
              key={s.id}
              className="aspect-[4/3] rounded-lg border border-line bg-surface p-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-fg-subtle">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Badge variant="soft" className="text-[10px]">{s.kind}</Badge>
              </div>
              <div className="mt-2 line-clamp-3 font-semibold text-fg">
                {slidePreviewTitle(s)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line bg-elevated p-6">
          <Button variant="ghost" onClick={onReset}>Upload another</Button>
          <Button variant="accent" onClick={onPresent}>
            Open slideshow →
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function slidePreviewTitle(s: Deck["slides"][number]): string {
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
      return `“${s.quote.slice(0, 80)}…”`;
    case "code":
      return s.title ?? `code · ${s.language}`;
    case "image":
      return s.title ?? s.alt ?? "image";
  }
}
