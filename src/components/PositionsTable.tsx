import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useApp } from "@/store/useApp";
import { ASC, CHART, NODES, SG, SIGNMEAN, houseOf } from "@/lib/data";
import { PLANET_COLORS } from "@/lib/tokens";
import { cn } from "@/lib/utils";
import type { SheetDescriptor } from "@/lib/sheets";

const deg = (lon: number) => Math.floor(((lon % 30) + 30) % 30);
const sgi = (lon: number) => Math.floor(((((lon % 360) + 360) % 360) / 30));
const pad = (n: number) => String(n).padStart(2, "0");
const pc = (k: string) => PLANET_COLORS[k] || "#c4b5ff";

interface Row {
  glyph: string;
  color: string;
  name: string;
  lon: number;
  house: number;
  sheet: SheetDescriptor;
}

/** Collapsible "Positionen" table — the data sheet, in the observatory's
 *  monospace voice. Every row taps through to its interpretation. */
export function PositionsTable() {
  const [open, setOpen] = useState(false);
  const openSheet = useApp((s) => s.openSheet);

  const rows: Row[] = [
    { glyph: "AC", color: pc("asc"), name: "Aszendent", lon: ASC, house: 1, sheet: { kind: "planet", key: "asc" } },
    ...CHART.map((p) => ({ glyph: p.glyph, color: pc(p.key), name: p.name, lon: p.lon, house: houseOf(p.lon), sheet: { kind: "planet", key: p.key } as SheetDescriptor })),
    ...NODES.map((n) => ({ glyph: n.glyph, color: pc(n.key), name: n.name, lon: n.lon, house: houseOf(n.lon), sheet: { kind: "node", key: n.key } as SheetDescriptor })),
  ];

  // element distribution (Feuer/Erde/Luft/Wasser) across the planets
  const elements: Record<string, number> = {};
  for (const p of CHART) {
    const el = SIGNMEAN[sgi(p.lon)].split(" ")[0];
    elements[el] = (elements[el] || 0) + 1;
  }
  const elementStr = ["Feuer", "Erde", "Luft", "Wasser"]
    .map((e) => `${elements[e] || 0}× ${e}`)
    .join("   ");

  return (
    <div className="vela-glass overflow-hidden rounded-2xl">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3.5">
        <span className="vela-label">Positionen · Tabelle</span>
        <ChevronDown className={cn("h-4 w-4 text-txt-2 transition-transform duration-300", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-line">
          {rows.map((r) => (
            <button
              key={r.name}
              onClick={() => openSheet(r.sheet)}
              className="flex w-full items-center gap-3 border-t border-line-soft px-4 py-2.5 text-left transition first:border-t-0 hover:bg-surface"
            >
              <span className="vela-glyph w-5 shrink-0 text-center text-base" style={{ color: r.color }}>
                {r.glyph}
              </span>
              <span className="flex-1 truncate font-body text-[13px] text-txt">{r.name}</span>
              <span className="font-mono text-[11px] text-txt-2">
                {SG[sgi(r.lon)]} {pad(deg(r.lon))}°
              </span>
              <span className="w-9 text-right font-mono text-[11px] text-txt-3">H{r.house}</span>
            </button>
          ))}
          <div className="border-t border-line px-4 py-3 font-mono text-[11px] text-mint">{elementStr}</div>
        </div>
      )}
    </div>
  );
}
