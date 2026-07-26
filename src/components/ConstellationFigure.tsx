import { useId, useMemo } from "react";
import { CONSTELLATIONS } from "@/lib/constellations";

/**
 * ConstellationFigure — die echte Strichfigur eines Tierkreis-Sternbilds.
 *
 * Gerendert aus `lib/constellations.ts` (HYG-Positionen, IAU-Linien, gegen
 * SIMBAD geprüft), nicht aus fertigen Bildern: so erbt die Karte die Palette
 * (`--rgb-iris`), skaliert verlustfrei und bleibt eine einzige Quelle.
 *
 * Projektion: Gnomonisch genähert um die Mitte des Sternbilds — bei diesen
 * Ausdehnungen (max. ~35°) ist der Fehler unter einem Prozent der Bildbreite.
 * Rektaszension läuft nach Osten, auf der Karte also nach LINKS; deshalb das
 * Minus in `x`. Sternbilder über den 0°/360°-Sprung (Fische) werden vorher
 * um den ersten Stern herum "aufgerollt", sonst reißt die Figur auseinander.
 */

/** Zeichen-Index (0 = Widder) → Schlüssel in CONSTELLATIONS. */
const KEY_BY_SIGN = [
  "widder", "stier", "zwillinge", "krebs", "loewe", "jungfrau",
  "waage", "skorpion", "schuetze", "steinbock", "wassermann", "fische",
] as const;

const VB = 100;
/** Rand im viewBox-Maß — hält Halos und Namen von der Kante weg. */
const PAD = 15;

/** Radius aus der Helligkeit: kleinere mag = hellerer Stern = größerer Punkt. */
const radiusOf = (mag: number) => Math.min(3.0, Math.max(0.5, (5.6 - mag) * 0.6));
const alphaOf = (mag: number) => Math.min(1, Math.max(0.42, 1.06 - (mag - 1) * 0.11));

interface Placed {
  x: number;
  y: number;
  mag: number;
  name: string;
  bayer: string;
}

function useFigure(sign: number) {
  return useMemo(() => {
    const c = CONSTELLATIONS[KEY_BY_SIGN[((sign % 12) + 12) % 12]];
    if (!c) return null;

    // RA um den ersten Stern herum aufrollen (0°/360°-Sprung entschärfen).
    const ref = c.stars[0].ra;
    const ras = c.stars.map((s) => ref + (((s.ra - ref + 540) % 360) - 180));
    const raC = (Math.min(...ras) + Math.max(...ras)) / 2;
    const decs = c.stars.map((s) => s.dec);
    const decC = (Math.min(...decs) + Math.max(...decs)) / 2;
    const cosD = Math.cos((decC * Math.PI) / 180);

    const raw = c.stars.map((s, i) => ({
      x: -(ras[i] - raC) * cosD,
      y: -(s.dec - decC),
      mag: s.mag,
      name: s.name,
      bayer: s.bayer,
    }));

    // Auf die viewBox einpassen, Seitenverhältnis erhalten (sonst wird die
    // Figur verzerrt und stimmt nicht mehr mit dem Himmel überein).
    const xs = raw.map((p) => p.x);
    const ys = raw.map((p) => p.y);
    const w = Math.max(...xs) - Math.min(...xs);
    const h = Math.max(...ys) - Math.min(...ys);
    const scale = (VB - 2 * PAD) / Math.max(w, h, 1e-6);
    const offX = (VB - w * scale) / 2 - Math.min(...xs) * scale;
    const offY = (VB - h * scale) / 2 - Math.min(...ys) * scale;

    const stars: Placed[] = raw.map((p) => ({ ...p, x: p.x * scale + offX, y: p.y * scale + offY }));
    return { c, stars };
  }, [sign]);
}

export function ConstellationFigure({
  sign,
  showNames = false,
  className,
}: {
  /** Tierkreis-Index, 0 = Widder. */
  sign: number;
  /** Eigennamen der hellsten Sterne einblenden (max. drei). */
  showNames?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const fig = useFigure(sign);
  if (!fig) return null;
  const { c, stars } = fig;

  // Beschriftet werden nur benannte, wirklich helle Sterne — sonst wird die
  // Figur zur Tabelle. Der hellste benannte Stern kommt immer dazu, sonst
  // bliebe ein lichtschwaches Sternbild wie die Fische ganz ohne Namen.
  // Am linken Rand kippt das Label nach rechts.
  const byBrightness = [...stars].filter((s) => s.name).sort((a, b) => a.mag - b.mag);
  const named = showNames ? byBrightness.filter((s, i) => i === 0 || s.mag <= 2.9).slice(0, 3) : [];

  return (
    <svg
      viewBox={`0 0 ${VB} ${VB}`}
      className={className}
      role="img"
      aria-label={`Sternbild ${c.german} (${c.latin})`}
    >
      <defs>
        <radialGradient id={`halo-${uid}`}>
          <stop offset="0%" stopColor="rgba(var(--rgb-iris),.55)" />
          <stop offset="45%" stopColor="rgba(var(--rgb-iris),.16)" />
          <stop offset="100%" stopColor="rgba(var(--rgb-iris),0)" />
        </radialGradient>
        <filter id={`glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      {/* Strichfigur: einmal weich als Schein, einmal scharf darüber */}
      <g stroke="rgba(var(--rgb-iris),.5)" strokeLinecap="round" filter={`url(#glow-${uid})`} opacity={0.5}>
        {c.lines.map(([a, b], i) => (
          <line key={`g${i}`} x1={stars[a].x} y1={stars[a].y} x2={stars[b].x} y2={stars[b].y} strokeWidth={0.9} />
        ))}
      </g>
      <g stroke="rgba(255,255,255,.34)" strokeLinecap="round">
        {c.lines.map(([a, b], i) => (
          <line key={`l${i}`} x1={stars[a].x} y1={stars[a].y} x2={stars[b].x} y2={stars[b].y} strokeWidth={0.32} />
        ))}
      </g>

      {/* Halo nur um die hellen Sterne — die schwachen bleiben Punkte */}
      {stars.filter((s) => s.mag <= 2.6).map((s, i) => (
        <circle key={`h${i}`} cx={s.x} cy={s.y} r={radiusOf(s.mag) * 3.4} fill={`url(#halo-${uid})`} />
      ))}

      {stars.map((s, i) => (
        <circle key={`s${i}`} cx={s.x} cy={s.y} r={radiusOf(s.mag)} fill="#F4F6FF" opacity={alphaOf(s.mag)}>
          <title>{`${s.name || s.bayer} · ${s.mag.toFixed(2)} mag`}</title>
        </circle>
      ))}

      {named.map((s, i) => (
        <text
          key={`n${i}`}
          x={s.x < VB / 2 ? s.x + radiusOf(s.mag) + 2.4 : s.x - radiusOf(s.mag) - 2.4}
          y={s.y + 1.1}
          textAnchor={s.x < VB / 2 ? "start" : "end"}
          fill="rgba(255,255,255,.5)"
          fontSize={3.4}
          letterSpacing={0.4}
          style={{ fontFamily: "var(--f-ui)", textTransform: "uppercase" }}
        >
          {s.name}
        </text>
      ))}
    </svg>
  );
}
