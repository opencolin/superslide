"use client";

import { motion } from "motion/react";
import { FileUp, Sparkles, Paintbrush, Rocket } from "lucide-react";

const steps = [
  {
    icon: FileUp,
    title: "Drop your deck",
    body: "PPTX, PDF, or Keynote. We parse text, structure, speaker notes, and image references.",
  },
  {
    icon: Sparkles,
    title: "AI infers intent",
    body: "Each slide is classified — title, bullets, chart, code, hero, comparison — and rebuilt with the right component.",
  },
  {
    icon: Paintbrush,
    title: "Theme to your brand",
    body: "Pick a built-in theme or paste your homepage URL. Colors, typography, and motion follow.",
  },
  {
    icon: Rocket,
    title: "Ship it",
    body: "Preview, present, embed, or export the Next.js source to your repo. Deploys to Vercel in one click.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 max-w-3xl">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
            <span className="mr-3 inline-block h-px w-8 align-middle bg-fg/40" />
            How it works
          </div>
          <h2 className="text-display text-balance text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1]">
            Four steps. <span className="text-fg-muted">No design system to wire up.</span>
          </h2>
        </div>
        <ol className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ y: 12 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="relative flex flex-col gap-5 rounded-2xl border border-line bg-surface p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-widest text-fg-muted">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
                <s.icon size={20} className="text-fg-muted" />
              </div>
              <h3 className="text-display text-xl font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-fg-muted">{s.body}</p>
              {i === steps.length - 1 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent-fg">
                  Own your code
                </span>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
