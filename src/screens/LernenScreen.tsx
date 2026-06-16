import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { GlassPanel } from "@/components/GlassPanel";
import { Explainable } from "@/components/Explainable";
import { useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";
import {
  ASPDEF,
  CHART,
  HOUSE,
  NODES,
  PINFO,
  SG,
  SIGNMEAN,
  SN,
} from "@/lib/data";
import type { SheetDescriptor } from "@/lib/sheets";

interface LearnItem {
  glyph: string;
  color: string;
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
      return SN.map((name, i) => ({
        glyph: SG[i],
        color: "#c4a6ff",
        title: name,
        sub: SIGNMEAN[i].split(" · ")[0],
        sheet: { kind: "sign", key: name },
      }));
    case "lhaeuser":
      return HOUSE.map((name, i) => ({
        glyph: String(i + 1),
        color: "#c4a6ff",
        title: `Haus ${i + 1}`,
        sub: name,
        sheet: { kind: "house", key: i + 1 },
      }));
    case "laspekte":
      return ASPDEF.map((d, i) => ({
        glyph: d.g,
        color: d.c,
        title: d.type,
        sub: d.nat,
        sheet: { kind: "asptype", key: i },
      }));
    case "lknoten":
      return NODES.map((n) => ({
        glyph: n.glyph,
        color: "#9bc0ff",
        title: n.name,
        sub: PINFO[n.key].role,
        sheet: { kind: "node", key: n.key },
      }));
    case "lplaneten":
    default:
      return CHART.map((p) => ({
        glyph: p.glyph,
        color: "#e7dcff",
        title: p.name,
        sub: PINFO[p.key].role,
        sheet: { kind: "planet", key: p.key },
      }));
  }
}

export function LernenScreen() {
  const learnCat = useApp((s) => s.learnCat);
  const setLearnCat = useApp((s) => s.setLearnCat);

  // featured "Konzept des Tages" — guarded so it can never render empty
  const featuredIdx = new Date().getDate() % ASPDEF.length;
  const featured = ASPDEF[featuredIdx] ?? ASPDEF[0];

  const items = itemsFor(learnCat);

  return (
    <ScreenShell>
      <div className="mb-5">
        <h1 className="vela-display !text-4xl">Astrologie</h1>
        <p className="vela-sub mt-1.5">Die Bausteine des Himmels</p>
      </div>

      {/* featured */}
      <Explainable sheet={{ kind: "asptype", key: featuredIdx }}>
        <GlassPanel className="p-5" nebula interactive>
          <div className="vela-eyebrow mb-3 font-semibold text-lilac/75">Konzept des Tages</div>
          <div className="font-display text-2xl font-extrabold leading-tight text-ink">
            {featured.type}
          </div>
          <div className="mt-1 font-body text-[11px] uppercase tracking-wide text-lilac/70">
            {featured.nat}
          </div>
          <p className="mt-3 font-body text-[13px] font-light leading-relaxed text-ink/80">
            {featured.plain}
          </p>
        </GlassPanel>
      </Explainable>

      {/* category pills */}
      <div className="-mx-[max(16px,4vw)] mt-6 overflow-x-auto px-[max(16px,4vw)]">
        <div className="flex w-max gap-2">
          {CATS.map((c) => {
            const active = learnCat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setLearnCat(c.key)}
                className={cn(
                  "shrink-0 rounded-pill border px-4 py-2 font-body text-xs transition active:scale-95",
                  active
                    ? "border-lilac/55 bg-lilac/[0.18] font-semibold text-ink-soft"
                    : "border-white/[0.09] bg-white/[0.05] text-ink-soft/60",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <SectionHead title="Erkunden" />
      <div className="flex flex-col gap-2.5">
        {items.map((it) => (
          <Explainable key={it.title} sheet={it.sheet}>
            <GlassPanel className="flex items-center gap-3.5 p-3.5" interactive>
              <div
                className="vela-glyph flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-lg"
                style={{ color: it.color }}
              >
                {it.glyph}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-ink">{it.title}</div>
                <div className="font-body text-xs font-light text-ink-soft/60">{it.sub}</div>
              </div>
              <span className="text-ink-soft/40">›</span>
            </GlassPanel>
          </Explainable>
        ))}
      </div>
    </ScreenShell>
  );
}
