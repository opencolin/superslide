"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal dialog built on the native <dialog> element so we get focus
 * trap + ESC + ::backdrop for free. No Radix dep.
 */
export function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  React.useEffect(() => {
    const d = ref.current;
    if (!d) return;
    function onCancel(e: Event) {
      e.preventDefault();
      onClose();
    }
    function onClick(e: MouseEvent) {
      // Click on the backdrop (== the dialog element itself) closes.
      if (e.target === d) onClose();
    }
    d.addEventListener("cancel", onCancel);
    d.addEventListener("click", onClick);
    return () => {
      d.removeEventListener("cancel", onCancel);
      d.removeEventListener("click", onClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className="rounded-2xl border-0 bg-transparent p-0 text-fg open:flex backdrop:bg-fg/35 backdrop:backdrop-blur-sm"
    >
      {children}
    </dialog>
  );
}

export function DialogContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "w-[min(440px,92vw)] rounded-2xl border border-line bg-surface p-6 shadow-lift",
        className,
      )}
    />
  );
}

export function DialogTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      {...props}
      className={cn("text-lg font-semibold tracking-tight text-fg", props.className)}
    />
  );
}

export function DialogDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={cn("mt-1.5 text-sm leading-relaxed text-fg-muted", props.className)}
    />
  );
}

export function DialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("mt-5 flex items-center gap-2", props.className)}
    />
  );
}
