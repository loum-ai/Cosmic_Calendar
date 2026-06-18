import { useApp } from "@/store/useApp";
import { CHART, NODES, SG, computeAspects } from "@/lib/data";
import { PLANET_COLORS } from "@/lib/tokens";

/**
 * Birth-chart wheel — zodiac ring, aspect lines, planet + node dots.
 * Every element is tappable and opens its explanation. A simplified,
 * de-clustered layout (dots pushed to distinct radii when close) — the
 * full interactive wheel lands in the next phase.
 */
const SIZE = 320;
const C = SIZE / 2;

function pt(lonDeg: number, r: number): [number, number] {
  // 0° Aries at left, going counter-clockwise (astrology convention)
  const a = ((180 - lonDeg) * Math.PI) / 180;
  return [C + r * Math.cos(a), C - r * Math.sin(a)];
}

export function ChartWheel() {
  const openSheet = useApp((s) => s.openSheet);
  const dismissCoach = useApp((s) => s.dismissCoach);
  const aspects = computeAspects();

  const tap = (kind: Parameters<typeof openSheet>[0]["kind"], key: string | number) => {
    dismissCoach();
    openSheet({ kind, key });
  };

  // de-cluster planets that sit within 7° of each other onto stepped radii
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
      {/* outer + inner rings */}
      <circle cx={C} cy={C} r={138} fill="none" stroke="rgba(139,92,246,0.32)" />
      <circle cx={C} cy={C} r={118} fill="none" stroke="rgba(139,92,246,0.16)" />
      <circle cx={C} cy={C} r={62} fill="none" stroke="rgba(139,92,246,0.18)" />

      {/* zodiac segments + glyphs */}
      {SG.map((g, i) => {
        const start = i * 30;
        const [lx, ly] = pt(start, 138);
        const [gx, gy] = pt(start + 15, 128);
        return (
          <g key={i}>
            <line x1={C} y1={C} x2={lx} y2={ly} stroke="rgba(139,92,246,0.12)" />
            <text
              x={gx}
              y={gy}
              fill="rgba(255,255,255,0.55)"
              fontSize={12}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'
            >
              {g}
            </text>
          </g>
        );
      })}

      {/* aspect lines */}
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
            stroke={a.def.c}
            strokeWidth={1.3}
            opacity={0.5}
            style={{ cursor: "pointer", filter: `drop-shadow(0 0 4px ${a.def.c})` }}
            onClick={() => tap("aspect", a.key)}
          />
        );
      })}

      {/* nodes */}
      {NODES.map((n) => {
        const [x, y] = pt(n.lon, 90);
        return (
          <g key={n.key} style={{ cursor: "pointer" }} onClick={() => tap("node", n.key)}>
            <circle cx={x} cy={y} r={11} fill="rgba(18,14,30,0.95)" stroke="#9bc0ff" />
            <text
              x={x}
              y={y}
              fill="#bcd8ff"
              fontSize={11}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'
            >
              {n.glyph}
            </text>
          </g>
        );
      })}

      {/* planets */}
      {CHART.map((p) => {
        const [x, y] = pt(p.lon, radius[p.key] ?? 100);
        const col = PLANET_COLORS[p.key] || "#e7dcff";
        return (
          <g key={p.key} style={{ cursor: "pointer" }} onClick={() => tap("planet", p.key)}>
            <circle
              cx={x}
              cy={y}
              r={11}
              fill="rgba(18,14,30,0.95)"
              stroke={col}
              strokeWidth={1.2}
              style={{ filter: `drop-shadow(0 0 6px ${col}aa)` }}
            />
            <text
              x={x}
              y={y}
              fill={col}
              fontSize={12}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'
            >
              {p.glyph}
            </text>
          </g>
        );
      })}

      {/* centre */}
      <circle cx={C} cy={C} r={3} fill="#8b5cf6" style={{ filter: "drop-shadow(0 0 6px #8b5cf6)" }} />
    </svg>
  );
}
