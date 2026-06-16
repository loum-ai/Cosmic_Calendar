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
      {/* flowing smoky nebula — gives the photographic, cinematic depth */}
      <div
        className="absolute inset-0 animate-iris opacity-70 mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 210deg at 38% 30%,rgba(154,79,255,0.0),rgba(154,79,255,0.28),rgba(31,208,126,0.22),rgba(80,40,160,0.0) 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute left-1/2 top-[34%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 mix-blend-screen animate-breath"
        style={{
          background:
            "radial-gradient(circle at 50% 50%,rgba(154,79,255,0.4),rgba(79,214,239,0.18) 45%,transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* crystal ray — diagonal highlight */}
      <div className="absolute inset-0 bg-[linear-gradient(138deg,transparent_38%,rgba(160,100,255,0.07)_47%,rgba(160,100,255,0.04)_50%,transparent_59%)]" />
      {/* vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,0,11,0.55)_0%,transparent_28%,transparent_72%,rgba(1,0,11,0.7)_100%)]" />
      <Starfield />
    </div>
  );
}
