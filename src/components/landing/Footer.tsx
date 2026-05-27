import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fg text-bg">
            <Sparkles size={14} strokeWidth={2.5} />
          </span>
          <span className="text-base font-semibold tracking-tight">superslide</span>
        </Link>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fg-muted">
          <Link href="/demo" className="hover:text-fg">Demo</Link>
          <Link href="/upload" className="hover:text-fg">Upload</Link>
          <a href="#how" className="hover:text-fg">How it works</a>
          <a href="#themes" className="hover:text-fg">Themes</a>
          <a href="#compare" className="hover:text-fg">Compare</a>
        </div>
        <div className="text-xs text-fg-muted">
          Built on Next.js · shadcn · Three.js · Vercel AI Gateway
        </div>
      </div>
    </footer>
  );
}
