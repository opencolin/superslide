"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { themes } from "@/lib/themes";
import { themeToCssVars } from "@/lib/themes/css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const themeIds = ["nebius", "nebius-dark", "vercel", "arctic", "oxide"] as const;

export function ThemePicker() {
  const [active, setActive] = useState<(typeof themeIds)[number]>("nebius");
  const theme = themes[active];
  const cssVars = themeToCssVars(theme);

  return (
    <section id="themes" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 grid items-end gap-6 md:grid-cols-[1.6fr_1fr]">
          <div>
            <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
              <span className="mr-3 inline-block h-px w-8 align-middle bg-fg/40" />
              Themes
            </div>
            <h2 className="text-display text-balance text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.1]">
              Your brand. <span className="text-fg-muted">One prop swap.</span>
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-fg-muted md:text-lg">
              Themes are JSON. Content is theme-free. Re-skin a whole deck by
              changing one value — or generate a theme from any URL.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {themeIds.map((id) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`group flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all ${
                  active === id
                    ? "border-fg bg-fg text-bg"
                    : "border-line bg-surface text-fg hover:border-line-strong"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full border"
                  style={{
                    background: themes[id].colors.accent,
                    borderColor: themes[id].colors.fg,
                  }}
                />
                {themes[id].name}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line shadow-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={cssVars as React.CSSProperties}
              className="bg-bg"
            >
              <div className="grid grid-cols-1 gap-px bg-line lg:grid-cols-[1.5fr_1fr]">
                {/* Live themed slide preview */}
                <div className="relative aspect-[16/10] bg-bg p-12">
                  <div
                    aria-hidden
                    className="absolute inset-0 grain opacity-40"
                  />
                  <div className="relative flex h-full flex-col justify-center gap-4">
                    <span
                      className="text-[11px] font-medium uppercase tracking-[0.2em]"
                      style={{ color: theme.colors.fgMuted ?? theme.colors.fg }}
                    >
                      <span className="mr-2 inline-block h-px w-5 align-middle bg-current opacity-50" />
                      Themed in {theme.name}
                    </span>
                    <div
                      className="text-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.05]"
                      style={{ color: theme.colors.fg }}
                    >
                      The same slide,
                      <br />
                      <span style={{ color: theme.colors.fg, opacity: 0.55 }}>
                        a different universe.
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-3.5 py-1.5 text-xs font-medium"
                        style={{
                          background: theme.colors.accent,
                          color: theme.colors.accentFg,
                        }}
                      >
                        {theme.vibe}
                      </span>
                      <span
                        className="rounded-full border px-3.5 py-1.5 text-xs"
                        style={{
                          borderColor: theme.colors.line ?? theme.colors.fg,
                          color: theme.colors.fg,
                        }}
                      >
                        radius: {theme.radius}
                      </span>
                      <span
                        className="rounded-full border px-3.5 py-1.5 text-xs"
                        style={{
                          borderColor: theme.colors.line ?? theme.colors.fg,
                          color: theme.colors.fg,
                        }}
                      >
                        {theme.fonts.sans.split(",")[0].trim()}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Spec card */}
                <div
                  className="grid grid-cols-2 gap-px bg-line p-px text-xs"
                  style={{ color: theme.colors.fg }}
                >
                  {[
                    { label: "Background", val: theme.colors.bg },
                    { label: "Surface", val: theme.colors.surface },
                    { label: "Foreground", val: theme.colors.fg },
                    { label: "Accent", val: theme.colors.accent },
                    { label: "Brand", val: theme.colors.brand },
                    { label: "Line", val: theme.colors.line ?? "-" },
                  ].map((sw) => (
                    <div
                      key={sw.label}
                      className="flex items-center justify-between gap-3 bg-bg px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-5 w-5 rounded border"
                          style={{
                            background: sw.val,
                            borderColor: theme.colors.line ?? theme.colors.fg,
                          }}
                        />
                        <span style={{ opacity: 0.7 }}>{sw.label}</span>
                      </div>
                      <span className="font-mono opacity-60">{sw.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-fg-muted">
          <div className="flex items-center gap-2">
            <Badge variant="soft">Coming soon</Badge>
            Paste a URL and Superslide infers the theme.
          </div>
          <a
            href="/upload"
            className="font-medium text-fg underline-offset-4 hover:underline"
          >
            Try it with your deck →
          </a>
        </div>
      </div>
    </section>
  );
}
