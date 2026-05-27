import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "accent" | "outline" | "soft";
}) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-tight",
        variant === "default" && "bg-fg text-bg",
        variant === "accent" && "bg-accent text-accent-fg",
        variant === "outline" && "border border-line text-fg",
        variant === "soft" && "bg-fg/8 text-fg",
        className,
      )}
    />
  );
}
