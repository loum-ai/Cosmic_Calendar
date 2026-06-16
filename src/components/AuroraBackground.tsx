import { Starfield } from "./Starfield";

/**
 * The deep-space backdrop, identical on every screen (user asked 5+×:
 * "Der Hintergrund überall wie auf Home"). Layered aurora gradients
 * (violet top-left, emerald bottom-right, indigo centre) + crystal ray
 * + vignette + twinkling starfield. Fixed behind all content.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-space">
      {/* base */}
      <div className="absolute inset-0 bg-[#01000b]" />
      {/* aurora 1 — violet upper-left, slow breath */}
      <div className="absolute inset-0 animate-breath bg-[radial-gradient(ellipse_70%_55%_at_10%_0%,rgba(88,18,190,0.52),transparent_68%)]" />
      {/* aurora 2 — emerald bottom-right */}
      <div className="absolute inset-0 animate-breath bg-[radial-gradient(ellipse_60%_48%_at_96%_100%,rgba(6,148,114,0.38),transparent_66%)] [animation-direction:reverse] [animation-duration:14s]" />
      {/* aurora 3 — indigo centre drift */}
      <div className="absolute inset-0 animate-drift bg-[radial-gradient(ellipse_44%_36%_at_55%_42%,rgba(72,28,168,0.22),transparent_72%)]" />
      {/* crystal ray — diagonal highlight */}
      <div className="absolute inset-0 bg-[linear-gradient(138deg,transparent_38%,rgba(160,100,255,0.07)_47%,rgba(160,100,255,0.04)_50%,transparent_59%)]" />
      {/* vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,0,11,0.55)_0%,transparent_28%,transparent_72%,rgba(1,0,11,0.7)_100%)]" />
      <Starfield />
    </div>
  );
}
