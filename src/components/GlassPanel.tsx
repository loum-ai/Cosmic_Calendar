import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** add a violet/emerald nebula fill behind the glass */
  nebula?: boolean;
  /** spring lift + glow on hover (for tappable cards) */
  interactive?: boolean;
}

/**
 * Floating glass panel with depth (moodboard: "schwebende Glas-Panels").
 * Rim-light + backdrop blur + soft long shadow. Never flat.
 */
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, nebula, interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-card border border-white/[0.09] bg-white/[0.04] backdrop-blur-md shadow-glass",
          interactive &&
            "cursor-pointer transition-all duration-300 will-change-transform hover:-translate-y-1.5 hover:border-lilac/50 hover:shadow-lift active:scale-[0.98]",
          className,
        )}
        {...props}
      >
        {nebula && (
          <div
            className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 rounded-full opacity-70 animate-iris"
            style={{
              background:
                "radial-gradient(circle at 50% 50%,rgba(154,79,255,0.45),rgba(31,208,126,0.22) 55%,transparent 72%)",
              filter: "blur(26px)",
            }}
          />
        )}
        <div className="relative">{children}</div>
      </div>
    );
  },
);
GlassPanel.displayName = "GlassPanel";
