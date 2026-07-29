import type { MouseEvent as ReactMouseEvent } from "react";
import { useApp } from "@/store/useApp";
import type { SheetDescriptor } from "@/lib/sheets";
import { ASC, CHART, CUSPS, MC, NODES, SG, computeAspects } from "@/lib/data";
import { ASPECT_MIN_OPACITY, PLANET_COLORS, PLANET_FALLBACK, istPunkt } from "@/lib/tokens";

/**
 * Geburtschart — ein lesbares Instrument. Klarer Tierkreisring, lesbare
 * Gradskala. Ein Tipp auf Planet, Knoten oder Aspekt steuert das Panel.
 *
 * Farbe kodiert die GRUPPE, nicht den einzelnen Planeten — den unterscheidet
 * sein Glyph. Vorher hatte jeder Körper einen eigenen Ton; dreizehn Töne
 * lassen sich bei 24px Durchmesser nicht sicher trennen, und die Palette lag
 * ausserhalb von loums Farbwelt. Siehe docs/VELA-LOUM-FARBEN.md.
 */
const SIZE = 320;
const C = SIZE / 2;

const INK = "#f3eeff";
const DOT = "#0a0814";

const colOf = (k: string) => PLANET_COLORS[k] ?? PLANET_FALLBACK;

function pt(lonDeg: number, r: number): [number, number] {
  const a = ((180 - lonDeg) * Math.PI) / 180;
  return [C + r * Math.cos(a), C - r * Math.sin(a)];
}

export function ChartWheel({ onPick, highlight }: { onPick?: (d: SheetDescriptor) => void; highlight?: string | null } = {}) {
  const openInfo = useApp((s) => s.openInfo);
  const dismissCoach = useApp((s) => s.dismissCoach);
  const aspects = computeAspects();
  const pick = (d: SheetDescriptor) => {
    dismissCoach();
    (onPick ?? openInfo)(d);
  };

  const sorted = [...CHART].sort((a, b) => a.lon - b.lon);
  const radius: Record<string, number> = {};
  let prev = -999;
  let lvl = 0;
  for (const p of sorted) {
    lvl = p.lon - prev < 7 ? lvl + 1 : 0;
    radius[p.key] = 108 - lvl * 16;
    prev = p.lon;
  }

  // Ein Tipp öffnet sofort — der Punkt, der dem Finger am nächsten liegt.
  // Vorher schaltete ein Tipp auf eng stehende Planeten in einen Auswahlmodus
  // ("WÄHLE EINEN PUNKT"). Der stammte aus der Zeit, als sie wirklich
  // übereinander lagen; seit sie nach innen gestaffelt werden
  // (radius: 108 - lvl*16), hat jeder seinen eigenen Platz.
  //
  // Warum "am nächsten" und nicht einfach das getroffene Element: die
  // Trefferflächen sind absichtlich fett (20px) und überlappen sich bei
  // 16px Abstand. Ohne diese Auflösung öffnet der zuletzt gezeichnete
  // Nachbar — man tippt Venus und bekommt den Mondknoten.
  const targets = [
    ...CHART.map((p) => ({ d: { kind: "planet", key: p.key } as SheetDescriptor, xy: pt(p.lon, radius[p.key] ?? 100) })),
    ...NODES.map((n) => ({ d: { kind: "node", key: n.key } as SheetDescriptor, xy: pt(n.lon, 90) })),
  ];
  const pickNearest = (e: ReactMouseEvent<SVGGElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * SIZE;
    const y = ((e.clientY - box.top) / box.height) * SIZE;
    let best = targets[0];
    let bestDist = Infinity;
    for (const t of targets) {
      const d = (t.xy[0] - x) ** 2 + (t.xy[1] - y) ** 2;
      if (d < bestDist) { bestDist = d; best = t; }
    }
    if (best) pick(best.d);
  };

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto h-auto w-full">
      {/* rings */}
      <circle cx={C} cy={C} r={145} fill="none" stroke="rgba(201,188,255,0.42)" strokeWidth={1} />
      <circle cx={C} cy={C} r={138} fill="none" stroke="rgba(255,255,255,0.20)" />
      <circle cx={C} cy={C} r={118} fill="none" stroke="rgba(255,255,255,0.14)" />
      <circle cx={C} cy={C} r={62} fill="none" stroke="rgba(255,255,255,0.14)" />

      {/* degree scale — minor 5° / major 30° */}
      {Array.from({ length: 72 }).map((_, t) => {
        const major = t % 6 === 0;
        const [x1, y1] = pt(t * 5, 145);
        const [x2, y2] = pt(t * 5, major ? 133 : 140);
        return (
          <line
            key={"tick" + t}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={major ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.26)"}
            strokeWidth={major ? 1.1 : 0.6}
          />
        );
      })}

      {/* zodiac glyphs */}
      {SG.map((g, i) => {
        const start = i * 30;
        const [lx, ly] = pt(start, 138);
        const [gx, gy] = pt(start + 15, 128);
        return (
          <g key={i}>
            <line x1={C} y1={C} x2={lx} y2={ly} stroke="rgba(255,255,255,0.07)" />
            <text x={gx} y={gy} fill="rgba(214,202,255,0.85)" fontSize={13} textAnchor="middle" dominantBaseline="central" fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'>
              {g}
            </text>
          </g>
        );
      })}

      {/* Placidus house cusps + numbers (AC & MC emphasised) */}
      {CUSPS.map((c, i) => {
        const [hx, hy] = pt(c, 138);
        const isAngle = i === 0 || i === 9;
        const next = CUSPS[(i + 1) % 12];
        const span = (((next - c) % 360) + 360) % 360;
        const [nx, ny] = pt(c + span / 2, 70);
        return (
          <g key={"cusp" + i}>
            <line
              x1={C}
              y1={C}
              x2={hx}
              y2={hy}
              stroke={isAngle ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.16)"}
              strokeWidth={isAngle ? 1.4 : 0.6}
            />
            <text x={nx} y={ny} fill="rgba(255,255,255,0.5)" fontSize={8.5} textAnchor="middle" dominantBaseline="central" fontFamily="'Space Mono',ui-monospace,monospace">
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* AC / MC labels */}
      {[
        { l: "AC", lon: ASC },
        { l: "MC", lon: MC },
      ].map((m) => {
        const [x, y] = pt(m.lon, 154);
        return (
          <text key={m.l} x={x} y={y} fill="#E8E5F2" fontSize={9.5} fontWeight={700} textAnchor="middle" dominantBaseline="central" fontFamily="'Space Mono',ui-monospace,monospace">
            {m.l}
          </text>
        );
      })}

      {/* aspect web — tinted by aspect type, selected one lights up */}
      {aspects.map((a) => {
        const [x1, y1] = pt(a.A.lon, radius[a.A.key] ?? 100);
        const [x2, y2] = pt(a.B.lon, radius[a.B.key] ?? 100);
        const on = highlight === a.key;
        return (
          <g key={a.key} style={{ cursor: "pointer" }} onClick={() => pick({ kind: "aspect", key: a.key })}>
            {/* fat invisible hit target */}
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeOpacity={0} strokeWidth={16} style={{ pointerEvents: "all" }} />
            {/* Deckkraft 0,55 statt 0,28: darunter reissen alle Linien WCAG
                1.4.11 (3:1 gefordert, 0,28 ergab 1,44:1). Strichart und
                Strichstärke kommen aus ASPDEF und tragen jetzt die
                Unterscheidung mit — Farbe allein sagt nur Fluss oder Spannung. */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={a.def.c}
              strokeOpacity={on ? 1 : ASPECT_MIN_OPACITY}
              strokeWidth={on ? a.def.w * 1.6 : a.def.w}
              strokeDasharray={a.def.dash || undefined}
              style={{ pointerEvents: "none", filter: on ? `drop-shadow(0 0 5px ${a.def.c})` : undefined }}
            />
          </g>
        );
      })}

      {/* nodes */}
      {NODES.map((n) => {
        const [x, y] = pt(n.lon, 90);
        const col = colOf(n.key);
        const on = highlight === n.key;
        return (
          <g key={n.key} data-point={`node:${n.key}`} style={{ cursor: "pointer" }} onClick={pickNearest}>
            <circle cx={x} cy={y} r={19} fill="#000" fillOpacity={0} style={{ pointerEvents: "all" }} />
            {/* Knoten sind rechnerische Punkte, keine Körper: offener Ring. */}
            <circle cx={x} cy={y} r={on ? 13 : 11} fill="none" stroke={col} strokeWidth={on ? 2 : 1.5} style={{ pointerEvents: "none", filter: on ? `drop-shadow(0 0 6px ${col})` : undefined }} />
            <text x={x} y={y} fill={col} fontSize={11} textAnchor="middle" dominantBaseline="central" fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'>
              {n.glyph}
            </text>
          </g>
        );
      })}

      {/* Planeten — jeder in seinem Ton; eng stehende sitzen nach innen
          gestaffelt, ein Tipp öffnet den nächstgelegenen. */}
      {CHART.map((p) => {
        const [x, y] = pt(p.lon, radius[p.key] ?? 100);
        const col = colOf(p.key);
        const on = highlight === p.key;
        return (
          <g key={p.key} data-point={`planet:${p.key}`} style={{ cursor: "pointer" }} onClick={pickNearest}>
            <circle cx={x} cy={y} r={20} fill="#000" fillOpacity={0} style={{ pointerEvents: "all" }} />
            {/* Dritte Unterscheidungsachse: Planeten gefüllt, rechnerische
                Punkte (Chiron, Lilith, AC) als offener Ring. */}
            <circle
              cx={x}
              cy={y}
              r={on ? 14 : 12}
              fill={istPunkt(p.key) ? "none" : DOT}
              stroke={col}
              strokeWidth={on ? 2.4 : istPunkt(p.key) ? 1.5 : 1.6}
              style={{ pointerEvents: "none", filter: `drop-shadow(0 0 ${on ? 7 : 2.5}px ${col})` }}
            />
            <text x={x} y={y} fill={on ? INK : col} fontSize={13} fontWeight={600} textAnchor="middle" dominantBaseline="central" pointerEvents="none" fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'>
              {p.glyph}
            </text>
          </g>
        );
      })}

      {/* centre */}
      <circle cx={C} cy={C} r={2.5} fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}
