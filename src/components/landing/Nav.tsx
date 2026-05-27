"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "border-b border-line bg-bg/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-fg text-bg">
            <Sparkles size={16} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight">superslide</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          <a href="#how" className="text-sm text-fg-muted hover:text-fg">How it works</a>
          <a href="#themes" className="text-sm text-fg-muted hover:text-fg">Themes</a>
          <a href="#compare" className="text-sm text-fg-muted hover:text-fg">vs. Gamma</a>
          <Link href="/demo" className="text-sm text-fg-muted hover:text-fg">Demo</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="hidden text-sm font-medium text-fg-muted hover:text-fg md:inline-block">
            Live demo →
          </Link>
          <Link href="/upload">
            <Button variant="primary" size="sm">Upload your deck</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
