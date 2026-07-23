import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { ScreenShell, SectionHead, PageHead } from "@/components/ScreenShell";
import { Explainable } from "@/components/Explainable";
import { GlyphBadge } from "@/components/GlyphBadge";
import { SignPortal } from "@/screens/SignPortal";
import { useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";
import { ASPDEF, CHART, HOUSE, NODES, PINFO, SG, SIGNMEAN, SN } from "@/lib/data";
import type { SheetDescriptor } from "@/lib/sheets";

interface LearnItem {
  glyph: string;
  title: string;
  sub: string;
  sheet: SheetDescriptor;
}

const CATS = [
  { key: "lplaneten", label: "Planeten" },
  { key: "lzeichen", label: "Tierkreiszeichen" },
  { key: "lhaeuser", label: "Häuser" },
  { key: "laspekte", label: "Verbindungen" },
  { key: "lknoten", label: "Mondknoten" },
];

function itemsFor(cat: string): LearnItem[] {
  switch (cat) {
    case "lzeichen":
      return SN.map((name, i) => ({ glyph: SG[i], title: name, sub: SIGNMEAN[i].split(" · ")[0], sheet: { kind: "sign", key: name } }));
    case "lhaeuser":
      return HOUSE.map((name, i) => ({ glyph: String(i + 1), title: `Haus ${i + 1}`, sub: name, sheet: { kind: "house", key: i + 1 } }));
    case "laspekte":
      return ASPDEF.map((d, i) => ({ glyph: d.g, title: d.type, sub: d.nat, sheet: { kind: "asptype", key: i } }));
    case "lknoten":
      return NODES.map((n) => ({ glyph: n.glyph, title: n.name, sub: PINFO[n.key].role, sheet: { kind: "node", key: n.key } }));
    case "lplaneten":
    default:
      return CHART.map((p) => ({ glyph: p.glyph, title: p.name, sub: PINFO[p.key].role, sheet: { kind: "planet", key: p.key } }));
  }
}

const signIdx = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30);

export function LernenScreen() {
  const learnCat = useApp((s) => s.learnCat);
  const setLearnCat = useApp((s) => s.setLearnCat);
  const [portal, setPortal] = useState(false);
  const sunP = CHART.find((p) => p.key === "sun");
  const sunSign = sunP ? signIdx(sunP.lon) : 0;

  const featuredIdx = new Date().getDate() % ASPDEF.length;
  const featured = ASPDEF[featuredIdx] ?? ASPDEF[0];
  const items = itemsFor(learnCat);

  return (
    <ScreenShell>
      <PageHead label="Wissen" title="Astrologie" sub="Die Bausteine des Himmels — in Klartext" />

      {/* concept of the day — editorial, no box */}
      <Explainable sheet={{ kind: "asptype", key: featuredIdx }}>
        <div className="mt-7 border-y border-line-soft py-7 transition hover:opacity-90">
          <div className="font-mono text-[11px] text-mint">KONZEPT DES TAGES</div>
          <div className="mt-3 font-display text-[clamp(26px,4vw,36px)] font-extrabold leading-[1.06] tracking-[-0.02em] text-txt">
            {featured.type}
          </div>
          <div className="mt-1 font-mono text-[11px] uppercase text-txt-3">{featured.nat}</div>
          <p className="mt-4 max-w-[48ch] font-body text-[14px] leading-relaxed text-txt-2">{featured.plain}</p>
          <span className="mt-3 inline-flex items-center gap-1 font-body text-[12px] text-lilac">
            Mehr dazu <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Explainable>

      {/* category pills */}
      <div className="-mx-[max(16px,4vw)] mt-7 overflow-x-auto px-[max(16px,4vw)]">
        <div className="flex w-max gap-2">
          {CATS.map((c) => {
            const active = learnCat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setLearnCat(c.key)}
                className={cn(
                  "shrink-0 rounded-pill border px-4 py-2 font-body text-xs transition active:scale-95",
                  active ? "border-lilac/55 bg-lilac/[0.18] font-semibold text-txt" : "border-line bg-surface text-txt-2",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sign Portal — die Poster-Bühne pro Zeichen (HiFi-Konzept), startet
          beim eigenen Sonnenzeichen; das Rad unten dreht durch alle zwölf. */}
      <button
        onClick={() => setPortal(true)}
        className="vela-tile vela-tile-hover group relative mt-7 flex w-full items-center gap-4 overflow-hidden p-5 text-left"
      >
        <span aria-hidden className="pointer-events-none absolute -right-3 -top-9 font-glyph text-[120px] leading-none text-[#97B5FF] opacity-[0.1]">{SG[sunSign]}</span>
        <span className="vela-glyph inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[24px] text-[#97B5FF]" style={{ background: "rgba(120,150,255,0.12)", boxShadow: "inset 0 0 0 1px rgba(120,150,255,0.4), 0 0 22px -4px rgba(120,150,255,0.5)" }}>
          {SG[sunSign]}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-cinzel text-[19px] uppercase leading-tight text-txt">Zeichen-Portal</span>
          <span className="mt-0.5 block font-body text-[13px] text-txt-3">Alle zwölf Zeichen als Bühne — mit deinem Einfluss darin.</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-txt-3 transition-transform group-hover:translate-x-0.5" />
      </button>

      <SectionHead title="Erkunden" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => (
          <Explainable key={it.title} sheet={it.sheet}>
            <div className="vela-tile vela-tile-hover flex items-center gap-3.5 p-4">
              <GlyphBadge glyph={it.glyph} size={38} />
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-txt">{it.title}</div>
                <div className="font-body text-xs text-txt-2">{it.sub}</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-txt-3" />
            </div>
          </Explainable>
        ))}
      </div>

      {portal && <SignPortal initial={sunSign} onClose={() => setPortal(false)} />}
    </ScreenShell>
  );
}
