"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BeforeAfter() {
  return (
    <section className="border-t border-line bg-surface/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              <span className="mr-3 inline-block h-px w-8 align-middle bg-fg/40" />
              Before / After
            </div>
            <h2 className="text-display text-balance text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1]">
              The same content. <span className="text-fg-muted">Two universes.</span>
            </h2>
          </div>
          <Link href="/demo" className="group inline-flex items-center gap-2 text-sm font-medium text-fg">
            Open the live "after" deck
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Before: Static PPTX */}
          <motion.div
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-elevated/40">
              <div className="flex items-center justify-between border-b border-line px-5 py-3 text-xs text-fg-muted">
                <span className="font-mono uppercase tracking-widest">Before · slide-12.pptx</span>
                <span className="font-mono">.pptx</span>
              </div>
              <div className="relative aspect-[16/10] bg-[#f7f5f0] p-10 text-[#222]">
                <div className="absolute left-10 top-10 text-[10px] tracking-widest text-[#777]">
                  COMPANY • CONFIDENTIAL
                </div>
                <div className="flex h-full flex-col justify-center">
                  <div className="text-[28px] font-semibold leading-tight text-[#1a1a1a]">
                    Builders Network
                  </div>
                  <ul className="mt-4 space-y-1.5 text-[14px] text-[#444]">
                    <li>• GPU compute when you need it</li>
                    <li>• Credits that scale with your trajectory</li>
                    <li>• Mentorship from people who shipped models</li>
                    <li>• A network of builders that ships</li>
                  </ul>
                  <div className="mt-6 inline-block w-fit border border-[#999] px-3 py-1 text-[12px]">
                    Apply now
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 font-mono text-[10px] text-[#999]">
                  12 / 30
                </div>
              </div>
            </Card>
          </motion.div>

          {/* After: Superslide */}
          <motion.div
            initial={{ y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <Card className="border-fg/20 shadow-lift">
              <div className="flex items-center justify-between border-b border-line px-5 py-3 text-xs text-fg-muted">
                <span className="font-mono uppercase tracking-widest">After · Superslide</span>
                <span className="font-mono">.tsx + R3F</span>
              </div>
              <Link href="/demo" className="block group">
                <div className="relative aspect-[16/10] overflow-hidden bg-bg p-10">
                  <div
                    aria-hidden
                    className="absolute inset-0 grain opacity-50"
                  />
                  <div className="relative flex h-full items-center gap-8">
                    <div className="flex flex-1 flex-col gap-4">
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-fg-muted">
                        <span className="mr-2 inline-block h-px w-5 align-middle bg-fg/40" />
                        Why
                      </span>
                      <div className="text-display text-[34px] font-semibold leading-[1.05] text-fg">
                        Everything an AI builder needs in one place.
                      </div>
                      <ul className="mt-2 space-y-2 text-[13px]">
                        {[
                          "GPU compute when you need it",
                          "Credits that scale with your trajectory",
                          "Mentorship from people who shipped models",
                        ].map((t, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 rounded-lg border border-line bg-surface/80 p-2.5"
                          >
                            <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-fg">
                              0{i + 1}
                            </span>
                            <span className="text-fg">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="hidden h-44 w-44 shrink-0 items-center justify-center md:flex">
                      <div className="relative h-full w-full">
                        <div
                          className="absolute inset-0 rounded-full border-2 border-accent animate-spin"
                          style={{ animationDuration: "12s" }}
                        />
                        <div
                          className="absolute inset-4 rounded-full border-2 border-fg/40 animate-spin"
                          style={{ animationDuration: "8s", animationDirection: "reverse" }}
                        />
                        <div className="absolute inset-10 rounded-full bg-accent" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-fg-muted">03 / 10</span>
                    <span className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-fg/8">
                      <span className="absolute left-0 top-0 h-full w-[30%] bg-fg" />
                    </span>
                  </div>
                </div>
              </Link>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
