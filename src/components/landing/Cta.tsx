"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hero3DScene } from "@/components/canvas/Hero3DScene";
import { ArrowRight, Upload } from "lucide-react";

export function Cta() {
  return (
    <section className="relative overflow-hidden border-t border-line">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col items-start gap-6">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
            <span className="mr-3 inline-block h-px w-8 align-middle bg-fg/40" />
            Try Superslide
          </div>
          <h2 className="text-display text-balance text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05]">
            You have a deck. We have an{" "}
            <span className="text-accent-fg bg-accent px-2 rounded">upgrade</span>.
          </h2>
          <p className="max-w-xl text-pretty text-lg leading-relaxed text-fg-muted">
            Drop your file. We rebuild it as a real interactive web app — themed,
            animated, deployable. Free while in beta.
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
        </div>
        <div className="relative h-[400px] w-full">
          <Hero3DScene scene="ribbon" accent="#e0ff4f" />
        </div>
      </div>
    </section>
  );
}
