import { cn } from "@/lib/utils";

interface IridescentOrbProps {
  size?: number;
  glyph?: string;
  glyphColor?: string;
  className?: string;
  spin?: boolean;
  float?: boolean;
}

/**
 * The "Chrom-Blob" — an iridescent chrome/glass sphere from the moodboard
 * (IMG_0558/0644). A rotating conic gradient under a glassy specular
 * highlight, with a soft violet/emerald halo. Used for hero glyphs,
 * the profile avatar and planet spheres. Pure CSS, no assets.
 */
export function IridescentOrb({
  size = 120,
  glyph,
  glyphColor = "rgba(240,234,255,0.92)",
  className,
  spin = true,
  float = true,
}: IridescentOrbProps) {
  return (
    <div
      className={cn("relative shrink-0", float && "animate-float", className)}
      style={{ width: size, height: size }}
    >
      {/* halo */}
      <div
        className="absolute inset-[-22%] rounded-full animate-iris"
        style={{
          background:
            "radial-gradient(circle at 50% 50%,rgba(154,79,255,0.45),rgba(31,208,126,0.25) 55%,transparent 72%)",
          filter: "blur(14px)",
        }}
      />
      {/* iridescent body */}
      <div className="absolute inset-0 overflow-hidden rounded-full shadow-[inset_0_2px_10px_rgba(255,255,255,0.35),0_18px_50px_-12px_rgba(120,40,220,0.7)]">
        <div
          className={cn("absolute inset-[-35%]", spin && "animate-spin18")}
          style={{
            background:
              "conic-gradient(from 0deg,#9a4fff,#4fd6ef,#42de96,#e0c4ff,#9a4fff)",
            filter: "blur(3px) saturate(1.35)",
          }}
        />
        {/* glassy specular highlight */}
        <div
          className="absolute inset-0 mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle at 34% 28%,rgba(255,255,255,0.85),transparent 42%)",
          }}
        />
        {/* dark rim for depth */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "inset 0 -10px 24px rgba(8,2,20,0.6)" }}
        />
      </div>
      {glyph && (
        <div
          className="vela-glyph absolute inset-0 flex items-center justify-center"
          style={{
            color: glyphColor,
            fontSize: size * 0.42,
            textShadow: "0 0 28px rgba(196,166,255,0.9)",
          }}
        >
          {glyph}
        </div>
      )}
    </div>
  );
}
