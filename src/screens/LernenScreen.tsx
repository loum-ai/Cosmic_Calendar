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

/* ── loum-Karten-Chemie ────────────────────────────────────────────────
   Solide Ink-Fläche, EINE 1px-Inset-Hairline, kein Drop-Shadow, kein Blur.
   Aktiver / gehoverter Zustand = dieselbe Hairline in iris.               */
const INK = "linear-gradient(180deg,#16161F 0%,#12121D 100%)";
const INK_HERO = "linear-gradient(180deg,#201D2C 0%,#1B1926 55%,#17141F 100%)";
const HAIR = "inset 0 0 0 1px rgba(255,255,255,0.13)";
const HAIR_IRIS = "inset 0 0 0 1px rgba(var(--rgb-iris),0.42)";

const EYEBROW = "font-body text-[11px] font-medium uppercase tracking-[0.18em] text-txt-3";
/* Karten-Titel: Cinzel Regular, FLACH, VERSALIEN — nie kursiv, nie bold. */
const CARD_TITLE = "font-body text-meta font-semibold uppercase leading-tight tracking-[0.02em] text-txt";

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

      {/* Konzept des Tages — solide Hero-Ink, Tiefe von innen, der Aspekt-
          Glyph als Wasserzeichen. Kein Blur, kein äußerer Schatten. */}
      {/* glow={false}: der lila Außen-Halo von Explainable ist ein äußerer
          Drop-Shadow — auf Karten verboten. Die Affordanz trägt die Karte
          selbst (iris-Hairline im Hover + Chevron). */}
      <Explainable sheet={{ kind: "asptype", key: featuredIdx }} glow={false}>
        <article
          className="group relative mt-7 overflow-hidden rounded-[20px] p-6"
          style={{ background: INK_HERO, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.13), inset 0 1px 0 rgba(255,255,255,0.05)" }}
        >
          <span aria-hidden className="pointer-events-none absolute -right-4 -top-10 font-glyph text-[140px] leading-none opacity-[0.09]" style={{ color: featured.c }}>{featured.g}</span>
          <span aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full" style={{ background: `radial-gradient(circle, ${featured.c}26 0%, transparent 70%)` }} />
          <div className="relative">
            <div className={EYEBROW}>Konzept des Tages</div>
            <h2 className="mt-3 font-cinzel text-h2 font-normal uppercase leading-[1.1] tracking-[-0.01em] text-txt">
              {featured.type}
            </h2>
            <div className={cn(EYEBROW, "mt-2")} style={{ color: featured.c, opacity: 0.85 }}>{featured.nat}</div>
            <p className="mt-4 max-w-[46ch] font-body text-[15px] leading-relaxed text-txt-2">{featured.plain}</p>
            <span className="mt-4 inline-flex items-center gap-1 font-body text-[13px] text-lilac">
              Mehr dazu <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </article>
      </Explainable>

      {/* category pills — solide Ink-Pills, aktiv = iris-Hairline */}
      <div className="-mx-[max(16px,4vw)] mt-7 overflow-x-auto px-[max(16px,4vw)]">
        <div className="flex w-max gap-2">
          {CATS.map((c) => {
            const active = learnCat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setLearnCat(c.key)}
                className={cn(
                  "shrink-0 rounded-pill px-4 py-2 font-body text-xs transition active:scale-95",
                  active ? "font-semibold text-txt" : "text-txt-2",
                )}
                style={{ background: INK, boxShadow: active ? HAIR_IRIS : HAIR }}
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
        className="group relative mt-7 flex w-full items-center gap-4 overflow-hidden rounded-[16px] p-5 text-left transition-shadow duration-200 hover:shadow-[inset_0_0_0_1px_rgba(var(--rgb-iris),0.42)]"
        style={{ background: INK, boxShadow: HAIR }}
      >
        <span aria-hidden className="pointer-events-none absolute -right-3 -top-9 font-glyph text-[120px] leading-none text-lilac opacity-[0.1]">{SG[sunSign]}</span>
        <span aria-hidden className="pointer-events-none absolute -bottom-20 left-6 h-48 w-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(var(--rgb-iris),0.16) 0%, transparent 70%)" }} />
        <span className="vela-glyph relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[24px] text-lilac" style={{ background: "rgba(var(--rgb-iris),0.12)", boxShadow: "inset 0 0 0 1px rgba(var(--rgb-iris),0.4)" }}>
          {SG[sunSign]}
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block font-body text-h5 font-semibold leading-tight tracking-[0.01em] text-txt">Zeichen-Portal</span>
          <span className="mt-1 block font-body text-[13px] leading-relaxed text-txt-3">Alle zwölf Zeichen als Bühne — mit deinem Einfluss darin.</span>
        </span>
        <ChevronRight className="relative h-5 w-5 shrink-0 text-txt-3 transition-transform group-hover:translate-x-0.5" />
      </button>

      <SectionHead title="Erkunden" />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => (
          <Explainable key={it.title} sheet={it.sheet} glow={false}>
            <div
              className="group relative flex items-center gap-3.5 overflow-hidden rounded-[16px] p-4 transition-shadow duration-200 hover:shadow-[inset_0_0_0_1px_rgba(var(--rgb-iris),0.42)]"
              style={{ background: INK, boxShadow: HAIR }}
            >
              <span aria-hidden className="pointer-events-none absolute -left-10 -top-12 h-32 w-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(var(--rgb-iris),0.13) 0%, transparent 70%)" }} />
              <GlyphBadge glyph={it.glyph} size={38} className="relative" />
              <div className="relative min-w-0 flex-1">
                <div className={CARD_TITLE}>{it.title}</div>
                <div className="mt-1 font-body text-[13px] leading-snug text-txt-2">{it.sub}</div>
              </div>
              <ChevronRight className="relative h-4 w-4 shrink-0 text-txt-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Explainable>
        ))}
      </div>

      {portal && <SignPortal initial={sunSign} onClose={() => setPortal(false)} />}
    </ScreenShell>
  );
}
