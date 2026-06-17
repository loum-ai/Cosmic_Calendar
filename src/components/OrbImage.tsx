import { cn } from "@/lib/utils";

/**
 * The hero orb — a real rendered iridescent planet (from the brand moodboard),
 * not a CSS approximation. Feathered transparent edges + a soft bloom behind.
 */
export function OrbImage({
  size = 150,
  float = true,
  className,
}: {
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
        className="absolute inset-[-24%] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 46%,rgba(140,90,230,0.5),rgba(60,185,205,0.22) 50%,transparent 72%)",
          filter: "blur(26px)",
        }}
      />
      <img
        src="/orb-planet.webp"
        alt=""
        draggable={false}
        className="relative h-full w-full select-none object-contain"
      />
    </div>
  );
}
