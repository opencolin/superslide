"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Upload } from "lucide-react";
import { Hero3DScene } from "@/components/canvas/Hero3DScene";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 grain opacity-50"
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.3fr_1fr] lg:pt-24">
        <motion.div
          initial={{ y: 16 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="flex flex-col items-start gap-7"
        >
          <Badge variant="outline" className="border-fg/15">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            New · AI Gateway × shadcn × Three.js
          </Badge>
          <h1 className="text-display text-balance text-[clamp(2.75rem,6.5vw,5.75rem)] font-semibold leading-[1.02] tracking-tight text-fg">
            Your deck deserves better than a{" "}
            <span className="relative inline-block">
              <span className="relative z-10">PDF.</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 -z-0 h-[28%] bg-accent"
              />
            </span>
          </h1>
          <p className="max-w-[52ch] text-pretty text-lg leading-relaxed text-fg-muted md:text-xl">
            Drop a PPTX, PDF, or Keynote. Superslide rebuilds it as a fully
            interactive web slideshow — themed to match your brand or any URL
            you paste, with real shadcn components and Three.js scenes.
          </p>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link href="/upload">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <Upload size={18} /> Upload your deck
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See the live demo <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-sm text-fg-muted">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-fg/40" />
              No login to try
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-fg/40" />
              Deploys to Vercel in one click
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-fg/40" />
              Your code, your repo
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0.96 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative aspect-square h-auto max-h-[560px] w-full"
        >
          <Hero3DScene scene="torus" accent="#e0ff4f" />
        </motion.div>
      </div>
    </section>
  );
}
