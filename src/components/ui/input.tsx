import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full min-w-0 rounded-2xl border border-lilac/25 bg-white/[0.05] px-4 py-2 font-body text-sm text-ink-soft placeholder:text-ink-soft/40 outline-none transition focus:border-lilac/60 focus:bg-white/[0.08]",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
