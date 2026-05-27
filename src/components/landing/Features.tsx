"use client";

import { motion } from "motion/react";
import {
  Box,
  Compass,
  FileUp,
  Keyboard,
  Paintbrush,
  Rocket,
  Sparkles,
  Workflow,
} from "lucide-react";

const features = [
  {
    icon: FileUp,
    title: "Lossless import",
    body: "PPTX, PDF, and Keynote. Speaker notes preserved. Bullets become real React, not screenshotted divs.",
  },
  {
    icon: Sparkles,
    title: "AI slide upgrader",
    body: "An LLM infers each slide's intent and picks the right interactive kind — chart, timeline, hero, code, comparison.",
  },
  {
    icon: Box,
    title: "Real Three.js scenes",
    body: "Title slides get a procedurally-shaded torus knot. Section hero gets distortion meshes. Not Lottie loops.",
  },
  {
    icon: Paintbrush,
    title: "Brand from a URL",
    body: "Paste your homepage. Superslide pulls colors, fonts, and motion language and applies it to every slide.",
  },
  {
    icon: Keyboard,
    title: "Live keyboard nav",
    body: "Arrow keys, space, O for overview, F for fullscreen, 1-9 to jump. Speaker view and timer included.",
  },
  {
    icon: Workflow,
    title: "Fragments + transitions",
    body: "Bullets reveal in sequence, charts animate from zero, scenes parallax. None of it requires you to author motion.",
  },
  {
    icon: Compass,
    title: "Themes that ship",
    body: "Neon, Vercel, Arctic, Oxide, or generate one from your URL. Swap with a single prop — content is theme-free.",
  },
  {
    icon: Rocket,
    title: "Deploys to Vercel",
    body: "Export the result as a Next.js repo and ship it. Your slideshow has its own domain, analytics, and source code.",
  },
];

export function Features() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 max-w-3xl">
          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
            <span className="mr-3 inline-block h-px w-8 align-middle bg-fg/40" />
            Capabilities
          </div>
          <h2 className="text-display text-balance text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1]">
            Built like a modern web app, because it{" "}
            <span className="text-fg-muted">is one.</span>
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ y: 8 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="group flex flex-col gap-4 bg-surface p-7 transition-colors hover:bg-elevated"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-bg text-fg transition-colors group-hover:border-fg/30 group-hover:bg-accent group-hover:text-accent-fg">
                <f.icon size={18} strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-base font-semibold tracking-tight text-fg">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-fg-muted">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
