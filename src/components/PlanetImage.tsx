import { cn } from "@/lib/utils";

/**
 * A real rendered planet image (cropped from the brand moodboard). The
 * source sits on near-black, so `screen` blend drops the background and the
 * planet + ring float cleanly on any dark surface. Soft bloom behind.
 */
export function PlanetImage({
  src,
  size = 96,
  float = false,
  className,
}: {
  src: string;
  size?: number;
  float?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("relative shrink-0", float && "animate-float", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-[-18%] rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 50%,rgba(140,110,230,0.35),transparent 70%)",
          filter: "blur(18px)",
        }}
      />
      <img
        src={src}
        alt=""
        draggable={false}
        className="relative h-full w-full select-none object-contain"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
