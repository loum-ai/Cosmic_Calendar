import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** spring lift + glow on hover (for tappable cards) */
  interactive?: boolean;
}

/**
 * The one canonical card. Flat, translucent, hairline rim-light — the
 * prototype's restraint, with the premium finish from `.vela-glass`
 * (saturate-through backdrop, dual rim, grain). NO per-card colored blobs:
 * the glow lives once in the ambient background, not on every surface.
 */
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "vela-glass rounded-[20px]",
          interactive &&
            "cursor-pointer transition-all duration-300 will-change-transform hover:-translate-y-1 hover:shadow-lift active:scale-[0.985]",
          className,
        )}
        {...props}
      >
        <div className="relative z-[1]">{children}</div>
      </div>
    );
  },
);
GlassPanel.displayName = "GlassPanel";
