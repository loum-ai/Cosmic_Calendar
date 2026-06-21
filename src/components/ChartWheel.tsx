import { useState } from "react";
import { useApp } from "@/store/useApp";
import type { SheetDescriptor } from "@/lib/sheets";
import { ASC, CHART, CUSPS, MC, NODES, SG, computeAspects } from "@/lib/data";

/**
 * Birth-chart wheel — a legible instrument. Crisp zodiac ring, readable
 * degree scale, colour-coded planets (each its own hue) so nothing blends
 * into the dark stage. Tapping a planet / node / aspect drives the panel.
 */
const SIZE = 320;
const C = SIZE / 2;

const INK = "#f3eeff";
const DOT = "#0a0814";

// per-body hue — bright enough to read on the near-black stage
const PCOL: Record<string, string> = {
  sun: "#ffce6e",
  moon: "#d7e3ff",
  mercury: "#8fd0e6",
  venus: "#46e8c4",
  mars: "#ff6a52",
  jupiter: "#ffce5e",
  saturn: "#cda6ff",
  uranus: "#79e6d6",
  neptune: "#9db6ff",
  pluto: "#d39aea",
  chiron: "#8fd0ff",
  lilith: "#e3a8d6",
  node_n: "#a9c8ff",
  node_s: "#a9c8ff",
};
const colOf = (k: string) => PCOL[k] ?? "#cbb9ff";

function pt(lonDeg: number, r: number): [number, number] {
  const a = ((180 - lonDeg) * Math.PI) / 180;
  return [C + r * Math.cos(a), C - r * Math.sin(a)];
}

export function ChartWheel({ onPick, highlight }: { onPick?: (d: SheetDescriptor) => void; highlight?: string | null } = {}) {
  const openInfo = useApp((s) => s.openInfo);
  const dismissCoach = useApp((s) => s.dismissCoach);
  const aspects = computeAspects();
  const [fan, setFan] = useState<number | null>(null); // open cluster index
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

  // group near-overlapping planets into clusters so the user can fan them out
  const clusters: string[][] = [];
  let cur: string[] = [];
  prev = -999;
  for (const p of sorted) {
    if (cur.length && p.lon - prev < 9) cur.push(p.key);
    else { if (cur.length) clusters.push(cur); cur = [p.key]; }
    prev = p.lon;
  }
  if (cur.length) clusters.push(cur);
  const clusterOf: Record<string, number> = {};
  clusters.forEach((c, i) => c.forEach((k) => (clusterOf[k] = i)));

  const planetClick = (key: string) => {
    const ci = clusterOf[key];
    if (clusters[ci] && clusters[ci].length > 1) { dismissCoach(); setFan(ci); }
    else pick({ kind: "planet", key });
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
          <text key={m.l} x={x} y={y} fill="#d8caff" fontSize={9.5} fontWeight={700} textAnchor="middle" dominantBaseline="central" fontFamily="'Space Mono',ui-monospace,monospace">
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
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={a.def.c}
              strokeOpacity={on ? 1 : 0.28}
              strokeWidth={on ? 1.8 : 0.9}
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
          <g key={n.key} style={{ cursor: "pointer" }} onClick={() => pick({ kind: "node", key: n.key })}>
            <circle cx={x} cy={y} r={19} fill="#000" fillOpacity={0} style={{ pointerEvents: "all" }} />
            <circle cx={x} cy={y} r={on ? 13 : 11} fill={DOT} stroke={col} strokeWidth={on ? 2 : 1.4} style={{ pointerEvents: "none", filter: on ? `drop-shadow(0 0 6px ${col})` : undefined }} />
            <text x={x} y={y} fill={col} fontSize={11} textAnchor="middle" dominantBaseline="central" fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'>
              {n.glyph}
            </text>
          </g>
        );
      })}

      {/* planets — each its own hue; clustered ones fan out on tap */}
      {CHART.map((p) => {
        const [x, y] = pt(p.lon, radius[p.key] ?? 100);
        const col = colOf(p.key);
        const on = highlight === p.key;
        const grouped = (clusters[clusterOf[p.key]]?.length ?? 1) > 1;
        return (
          <g key={p.key} style={{ cursor: "pointer" }} onClick={() => planetClick(p.key)}>
            <circle cx={x} cy={y} r={20} fill="#000" fillOpacity={0} style={{ pointerEvents: "all" }} />
            <circle cx={x} cy={y} r={on ? 14 : 12} fill={DOT} stroke={col} strokeWidth={on ? 2.4 : 1.6} style={{ pointerEvents: "none", filter: `drop-shadow(0 0 ${on ? 7 : 2.5}px ${col})` }} />
            <text x={x} y={y} fill={on ? INK : col} fontSize={13} fontWeight={600} textAnchor="middle" dominantBaseline="central" pointerEvents="none" fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'>
              {p.glyph}
            </text>
            {grouped && <circle cx={x + 9} cy={y - 9} r={2} fill="#fff" pointerEvents="none" opacity={0.85} />}
          </g>
        );
      })}

      {/* cluster fan-out: pick any planet that sits on the same spot */}
      {fan !== null && clusters[fan] && (() => {
        const members = clusters[fan].map((k) => CHART.find((p) => p.key === k)!);
        const avgLon = members.reduce((s, m) => s + m.lon, 0) / members.length;
        const [ax, ay] = pt(avgLon, 120);
        const n = members.length;
        const sp = 32;
        const x0 = Math.max(22, Math.min(SIZE - 22 - (n - 1) * sp, ax - ((n - 1) * sp) / 2));
        const cy = Math.max(34, Math.min(SIZE - 30, ay));
        return (
          <g>
            <rect x={0} y={0} width={SIZE} height={SIZE} fill="rgba(5,5,12,0.74)" style={{ pointerEvents: "all", cursor: "pointer" }} onClick={() => setFan(null)} />
            <text x={C} y={18} fill="rgba(255,255,255,0.75)" fontSize={8} textAnchor="middle" fontFamily="'Space Mono',ui-monospace,monospace" letterSpacing={1}>WÄHLE EINEN PUNKT</text>
            {members.map((m, idx) => {
              const cx = x0 + idx * sp;
              const c = colOf(m.key);
              return (
                <g key={m.key} style={{ cursor: "pointer" }} onClick={() => { setFan(null); pick({ kind: "planet", key: m.key }); }}>
                  <circle cx={cx} cy={cy} r={16} fill={DOT} stroke={c} strokeWidth={2} style={{ filter: `drop-shadow(0 0 7px ${c})` }} />
                  <text x={cx} y={cy} fill={c} fontSize={15} fontWeight={600} textAnchor="middle" dominantBaseline="central" pointerEvents="none" fontFamily='"Noto Sans Symbols","Segoe UI Symbol",system-ui,sans-serif'>{m.glyph}</text>
                  <text x={cx} y={cy + 25} fill="rgba(255,255,255,0.82)" fontSize={6.5} textAnchor="middle" pointerEvents="none" fontFamily='"Plus Jakarta Sans",sans-serif'>{m.name}</text>
                </g>
              );
            })}
          </g>
        );
      })()}

      {/* centre */}
      <circle cx={C} cy={C} r={2.5} fill="rgba(255,255,255,0.7)" />
    </svg>
  );
}
