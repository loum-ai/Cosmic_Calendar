import { useId } from "react";
import { cn } from "@/lib/utils";

interface CrystalGemProps {
  size?: number;
  className?: string;
  float?: boolean;
  glyph?: string;
}

/**
 * A faceted, iridescent crystal — the hero "Chrom-Blob/Kristall" from the
 * moodboard (IMG_0551/0556). Built from SVG facets with violet↔emerald
 * gradients, bright specular highlights and a chromatic bloom. Pure vector,
 * no assets, scales crisply.
 */
export function CrystalGem({ size = 150, className, float = true, glyph }: CrystalGemProps) {
  const id = useId().replace(/:/g, "");
  return (
    <div
      className={cn("relative shrink-0", float && "animate-float", className)}
      style={{ width: size, height: size }}
    >
      {/* chromatic bloom behind the gem */}
      <div
        className="absolute inset-[-30%] animate-iris"
        style={{
          background:
            "radial-gradient(circle at 50% 45%,rgba(154,79,255,0.55),rgba(31,208,126,0.32) 48%,transparent 72%)",
          filter: "blur(22px)",
        }}
      />
      <svg viewBox="0 0 200 200" className="relative h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`g1${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4ecff" />
            <stop offset="45%" stopColor="#b89cff" />
            <stop offset="100%" stopColor="#6a3ec8" />
          </linearGradient>
          <linearGradient id={`g2${id}`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bff5dc" />
            <stop offset="55%" stopColor="#4fd6ef" />
            <stop offset="100%" stopColor="#1b8f72" />
          </linearGradient>
          <linearGradient id={`g3${id}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#7a4fd0" />
            <stop offset="100%" stopColor="#e0c4ff" />
          </linearGradient>
          <radialGradient id={`spec${id}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow${id}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter={`url(#glow${id})`} className="animate-iris" style={{ transformOrigin: "center" }}>
          {/* main octahedral crystal facets */}
          <polygon points="100,14 150,78 100,100 64,70" fill={`url(#g1${id})`} opacity="0.96" />
          <polygon points="150,78 138,150 100,100" fill={`url(#g2${id})`} opacity="0.92" />
          <polygon points="100,14 64,70 52,120 100,100" fill={`url(#g3${id})`} opacity="0.88" />
          <polygon points="100,100 52,120 100,186 138,150" fill={`url(#g1${id})`} opacity="0.8" />
          <polygon points="100,100 138,150 100,186" fill={`url(#g2${id})`} opacity="0.7" />
          <polygon points="100,14 150,78 100,100" fill="#ffffff" opacity="0.14" />
          {/* facet edges */}
          <g stroke="#ffffff" strokeWidth="0.8" opacity="0.5" fill="none">
            <polygon points="100,14 150,78 138,150 100,186 52,120 64,70" />
            <line x1="100" y1="14" x2="100" y2="100" />
            <line x1="64" y1="70" x2="100" y2="100" />
            <line x1="150" y1="78" x2="100" y2="100" />
            <line x1="52" y1="120" x2="100" y2="100" />
            <line x1="138" y1="150" x2="100" y2="100" />
          </g>
          {/* specular sparkle */}
          <circle cx="86" cy="58" r="16" fill={`url(#spec${id})`} />
        </g>

        {glyph && (
          <text
            x="100"
            y="104"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="34"
            fill="#fff"
            opacity="0.92"
            style={{ textShadow: "0 0 18px rgba(196,166,255,0.9)" }}
            fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'
          >
            {glyph}
          </text>
        )}
      </svg>
    </div>
  );
}
