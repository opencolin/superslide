import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border border-line bg-surface px-3.5 text-[15px] text-fg placeholder:text-fg-subtle outline-none focus:border-fg/40 transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
