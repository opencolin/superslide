"use client";

import { Check, Minus, X } from "lucide-react";
import { motion } from "motion/react";

const rows = [
  ["Input: existing PPTX/PDF/Keynote", "yes", "partial", "no"],
  ["Output: real Next.js app, your repo", "yes", "no", "no"],
  ["Three.js / WebGL scenes", "yes", "no", "no"],
  ["shadcn / Tailwind components", "yes", "no", "no"],
  ["Brand from a URL", "yes", "partial", "no"],
  ["Speaker notes preserved", "yes", "partial", "yes"],
  ["Keyboard-first nav + overview", "yes", "yes", "yes"],
  ["Generic AI deck from a prompt", "no", "yes", "yes"],
] as const;

const cols = ["Superslide", "Gamma", "PowerPoint Copilot"];

function Mark({ v }: { v: string }) {
  if (v === "yes") return <Check size={16} className="text-fg" />;
  if (v === "no") return <X size={16} className="text-fg-subtle" />;
  return <Minus size={16} className="text-fg-muted" />;
}

export function Compare() {
  return (
    <section id="compare" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12 max-w-3xl">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
            <span className="mr-3 inline-block h-px w-8 align-middle bg-fg/40" />
            vs. The field
          </div>
          <h2 className="text-display text-balance text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1]">
            Most AI deck tools build <span className="text-fg-muted">decks.</span>
            <br />
            Superslide builds <span className="text-accent-fg bg-accent px-2 rounded">websites.</span>
          </h2>
        </div>
        <motion.div
          initial={{ y: 16 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
        >
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] divide-x divide-line">
            <div className="bg-elevated p-4 text-xs font-medium uppercase tracking-widest text-fg-muted">
              Capability
            </div>
            {cols.map((c, i) => (
              <div
                key={c}
                className={`p-4 text-xs font-semibold uppercase tracking-widest ${
                  i === 0 ? "bg-accent text-accent-fg" : "bg-elevated text-fg"
                }`}
              >
                {c}
              </div>
            ))}
            {rows.map((row, ri) => (
              <FragRow key={ri} row={row} odd={ri % 2 === 1} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FragRow({ row, odd }: { row: readonly string[]; odd: boolean }) {
  return (
    <>
      <div className={`p-4 text-sm text-fg ${odd ? "bg-elevated/30" : ""}`}>
        {row[0]}
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`flex items-center justify-center p-4 ${odd ? "bg-elevated/30" : ""}`}
        >
          <Mark v={row[i]} />
        </div>
      ))}
    </>
  );
}
