import { useApp } from "@/store/useApp";
import { ASC, CHART, CUSPS, MC, NODES, SG, computeAspects } from "@/lib/data";

/**
 * Birth-chart wheel — a refined, near-monochrome instrument (no rainbow).
 * Zodiac ring, faint aspect web, planet + node dots. Planets/nodes open a
 * full detail page; aspects open the bottom sheet.
 */
const SIZE = 320;
const C = SIZE / 2;

// restrained, single-accent palette — the "instrument", not a toy
const INK = "rgba(236,230,255,0.92)";
const DOT = "rgba(9,8,18,0.96)";
const RIM = "rgba(150,120,255,0.45)";

function pt(lonDeg: number, r: number): [number, number] {
  const a = ((180 - lonDeg) * Math.PI) / 180;
  return [C + r * Math.cos(a), C - r * Math.sin(a)];
}

export function ChartWheel() {
  const openDetail = useApp((s) => s.openDetail);
  const openSheet = useApp((s) => s.openSheet);
  const dismissCoach = useApp((s) => s.dismissCoach);
  const aspects = computeAspects();

  const sorted = [...CHART].sort((a, b) => a.lon - b.lon);
  const radius: Record<string, number> = {};
  let prev = -999;
  let lvl = 0;
  for (const p of sorted) {
    lvl = p.lon - prev < 7 ? lvl + 1 : 0;
    radius[p.key] = 108 - lvl * 16;
    prev = p.lon;
  }

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto h-auto w-full">
      {/* rings — quiet violet/white */}
      <circle cx={C} cy={C} r={145} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={0.8} />
      <circle cx={C} cy={C} r={138} fill="none" stroke="rgba(255,255,255,0.10)" />
      <circle cx={C} cy={C} r={118} fill="none" stroke="rgba(255,255,255,0.06)" />
      <circle cx={C} cy={C} r={62} fill="none" stroke="rgba(255,255,255,0.06)" />

      {/* degree scale — minor 5° / major 30°, monochrome */}
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
            stroke={major ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)"}
            strokeWidth={major ? 1 : 0.5}
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
            <line x1={C} y1={C} x2={lx} y2={ly} stroke="rgba(255,255,255,0.05)" />
            <text x={gx} y={gy} fill="rgba(255,255,255,0.45)" fontSize={11} textAnchor="middle" dominantBaseline="central" fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'>
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
              stroke={isAngle ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.08)"}
              strokeWidth={isAngle ? 1.2 : 0.5}
            />
            <text x={nx} y={ny} fill="rgba(255,255,255,0.32)" fontSize={8} textAnchor="middle" dominantBaseline="central" fontFamily="'Space Mono',ui-monospace,monospace">
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
          <text key={m.l} x={x} y={y} fill="rgba(255,255,255,0.7)" fontSize={9} fontWeight={700} textAnchor="middle" dominantBaseline="central" fontFamily="'Space Mono',ui-monospace,monospace">
            {m.l}
          </text>
        );
      })}

      {/* aspect web — one faint colour, no glow, no rainbow */}
      {aspects.map((a) => {
        const [x1, y1] = pt(a.A.lon, radius[a.A.key] ?? 100);
        const [x2, y2] = pt(a.B.lon, radius[a.B.key] ?? 100);
        return (
          <line
            key={a.key}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(176,160,255,0.16)"
            strokeWidth={0.8}
            style={{ cursor: "pointer" }}
            onClick={() => {
              dismissCoach();
              openSheet({ kind: "aspect", key: a.key });
            }}
          />
        );
      })}

      {/* nodes */}
      {NODES.map((n) => {
        const [x, y] = pt(n.lon, 90);
        return (
          <g
            key={n.key}
            style={{ cursor: "pointer" }}
            onClick={() => {
              dismissCoach();
              openDetail({ kind: "node", key: n.key });
            }}
          >
            <circle cx={x} cy={y} r={11} fill={DOT} stroke={RIM} strokeWidth={1} />
            <text x={x} y={y} fill={INK} fontSize={11} textAnchor="middle" dominantBaseline="central" fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'>
              {n.glyph}
            </text>
          </g>
        );
      })}

      {/* planets */}
      {CHART.map((p) => {
        const [x, y] = pt(p.lon, radius[p.key] ?? 100);
        return (
          <g
            key={p.key}
            style={{ cursor: "pointer" }}
            onClick={() => {
              dismissCoach();
              openDetail({ kind: "planet", key: p.key });
            }}
          >
            <circle cx={x} cy={y} r={12} fill={DOT} stroke={RIM} strokeWidth={1} />
            <text x={x} y={y} fill={INK} fontSize={13} textAnchor="middle" dominantBaseline="central" fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'>
              {p.glyph}
            </text>
          </g>
        );
      })}

      {/* centre */}
      <circle cx={C} cy={C} r={2.5} fill="rgba(255,255,255,0.6)" />
    </svg>
  );
}
