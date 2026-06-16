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
          "vela-refract relative overflow-hidden rounded-card border border-white/[0.1] backdrop-blur-xl",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-20px_40px_-30px_rgba(120,40,220,0.5),0_28px_60px_-22px_rgba(0,0,0,0.85)]",
          interactive &&
            "cursor-pointer transition-all duration-300 will-change-transform hover:-translate-y-1.5 hover:border-lilac/60 hover:shadow-lift active:scale-[0.98]",
          className,
        )}
        style={{
          // subtle internal nebula glass tint on every panel — never flat
          background:
            "linear-gradient(145deg,rgba(124,78,210,0.12),rgba(20,16,32,0.32) 46%,rgba(31,208,126,0.07))",
        }}
        {...props}
      >
        {nebula && (
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-48 w-48 rounded-full opacity-80 animate-iris mix-blend-screen"
            style={{
              background:
                "radial-gradient(circle at 50% 50%,rgba(154,79,255,0.6),rgba(31,208,126,0.3) 52%,transparent 72%)",
              filter: "blur(30px)",
            }}
          />
        )}
        <div className="relative">{children}</div>
      </div>
    );
  },
);
GlassPanel.displayName = "GlassPanel";
