import { cn } from "@/lib/utils";

interface IridescentOrbProps {
  size?: number;
  glyph?: string;
  glyphColor?: string;
  className?: string;
  float?: boolean;
}

/**
 * Premium iridescent orb — a shaded sphere (offset radial = volume) with a
 * soft-light conic film and a small hard specular. The three things that
 * make it read photographic, not cartoon: dark terminator, soft-light
 * iridescence, and a specular separate from the bloom.
 */
export function IridescentOrb({
  size = 80,
  glyph,
  glyphColor = "rgba(255,255,255,0.92)",
  className,
  float = false,
}: IridescentOrbProps) {
  return (
    <div
      className={cn("vela-orb shrink-0", float && "animate-float", className)}
      style={{ width: size, height: size }}
    >
      {glyph && (
        <div
          className="vela-glyph absolute inset-0 z-[2] flex items-center justify-center"
          style={{
            color: glyphColor,
            fontSize: size * 0.4,
            textShadow: "0 1px 10px rgba(10,4,30,0.6)",
          }}
        >
          {glyph}
        </div>
      )}
    </div>
  );
}
