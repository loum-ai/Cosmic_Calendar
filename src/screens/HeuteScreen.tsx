import { HelpCircle, ChevronRight } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { GlyphBadge } from "@/components/GlyphBadge";
import { Explainable } from "@/components/Explainable";
import { ChartWheel } from "@/components/ChartWheel";
import { PositionsTable } from "@/components/PositionsTable";
import { KlartextToggle } from "@/components/KlartextToggle";
import { Term } from "@/components/Term";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/useApp";
import type { SheetDescriptor } from "@/lib/sheets";
import {
  ASC,
  CHART,
  HOUSE,
  IMPULSE,
  MC,
  NODES,
  PINFO,
  PROFILE,
  SG,
  SN,
  TRANSITS,
  computeAspects,
  houseOf,
  signName,
} from "@/lib/data";

const deg = (lon: number) => Math.floor(((lon % 30) + 30) % 30);
const sgi = (lon: number) => Math.floor(((((lon % 360) + 360) % 360) / 30));
const pad = (n: number) => String(n).padStart(2, "0");

const HELP_ITEMS = [
  { icon: "✦", title: "Tippe alles, was leuchtet", body: "Jeder Planet, jede Linie, jedes Haus öffnet eine Erklärung in Klartext." },
  { icon: "☉", title: "Dein Geburtsrad", body: "Der innere Kreis zeigt deine Planeten, der äußere die Sternzeichen." },
  { icon: "△", title: "Die Linien", body: "Verbindungen zwischen Planeten — wie deine Kräfte miteinander sprechen." },
  { icon: "↑", title: "Frag dein Horoskop", body: "Unten rechts kannst du jederzeit eine Frage stellen — Vela antwortet aus deinem Chart." },
];

/** One consistent planet card (glass + orb glyph), used for notable positions. */
function PlanetCard({ k, glyph, name, meta, role }: { k: string; glyph: string; name: string; meta: string; role?: string }) {
  return (
    <Explainable sheet={{ kind: "planet", key: k }} className="h-full">
      <div className="vela-tile vela-tile-hover flex h-full items-start gap-3 p-4">
        <GlyphBadge glyph={glyph} size={44} />
        <div className="min-w-0">
          <div className="font-display text-[15px] font-semibold leading-tight text-txt">{name}</div>
          <div className="mt-0.5 font-mono text-[11px] text-lilac">{meta}</div>
          {role && <p className="vela-keyword mt-1.5">{role}</p>}
        </div>
        <ChevronRight className="ml-auto h-4 w-4 shrink-0 self-center text-txt-3" />
      </div>
    </Explainable>
  );
}

function HouseGrid() {
  return (
    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3">
      {HOUSE.map((name, i) => {
        const h = i + 1;
        const ps = CHART.filter((p) => (p.house ?? houseOf(p.lon)) === h);
        const occ = ps.length > 0;
        return (
          <Explainable key={h} sheet={{ kind: "house", key: h }}>
            <div className="flex items-center gap-3 border-b border-line-soft py-3">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[12px]",
                  occ ? "bg-violet/20 text-lilac" : "text-txt-3",
                )}
              >
                {h}
              </div>
              <div className={cn("min-w-0 flex-1 font-body text-sm", occ ? "text-txt" : "text-txt-2")}>{name}</div>
              <div className={cn("vela-glyph shrink-0 text-base", occ ? "text-lilac" : "text-transparent")}>
                {ps.map((p) => p.glyph).join(" ")}
              </div>
            </div>
          </Explainable>
        );
      })}
    </div>
  );
}

function SignChips() {
  const chips = SN.map((name, i) => {
    const ps = CHART.filter((p) => signName(p.lon) === name);
    if (!ps.length) return null;
    return (
      <Explainable key={name} sheet={{ kind: "sign", key: name }} className="shrink-0">
        <div className="flex items-center gap-2 border border-line rounded-pill px-3.5 py-2">
          <span className="vela-glyph text-lilac">{SG[i]}</span>
          <span className="font-body text-xs text-txt-2">{name}</span>
          <span className="vela-glyph text-xs text-txt-3">{ps.map((p) => p.glyph).join("")}</span>
        </div>
      </Explainable>
    );
  });
  return <div className="flex flex-wrap gap-2">{chips}</div>;
}

export function HeuteScreen() {
  const showHelp = useApp((s) => s.showHelp);
  const setShowHelp = useApp((s) => s.setShowHelp);
  const setTab = useApp((s) => s.setTab);
  const openDetail = useApp((s) => s.openDetail);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 17 ? "Guten Tag" : "Guten Abend";
  const dateShort = now.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const firstName = PROFILE.name.split(" ")[0];
  const ephemeris = `☉ ${SG[sgi(CHART[0].lon)]} ${pad(deg(CHART[0].lon))}°   ☽ ${SG[sgi(CHART[1].lon)]} ${pad(deg(CHART[1].lon))}°   AC ${SG[sgi(ASC)]} ${pad(deg(ASC))}°`;

  // slim dashboard — the few values that matter most
  const venus = CHART.find((p) => p.key === "venus")!;
  const nodeN = NODES.find((n) => n.key === "node_n")!;
  const nodeS = NODES.find((n) => n.key === "node_s")!;
  const dash: { label: string; lon: number; sheet: SheetDescriptor | null }[] = [
    { label: "Sonne", lon: CHART[0].lon, sheet: { kind: "planet", key: "sun" } },
    { label: "Mond", lon: CHART[1].lon, sheet: { kind: "planet", key: "moon" } },
    { label: "Venus", lon: venus.lon, sheet: { kind: "planet", key: "venus" } },
    { label: "Aszendent", lon: ASC, sheet: { kind: "planet", key: "asc" } },
    { label: "MC", lon: MC, sheet: null },
    { label: "☊ Nordknoten", lon: nodeN.lon, sheet: { kind: "node", key: "node_n" } },
    { label: "☋ Südknoten", lon: nodeS.lon, sheet: { kind: "node", key: "node_s" } },
  ];

  // notable positions = the most-aspected planets (the "loudest" voices)
  const count: Record<string, number> = {};
  computeAspects().forEach((a) => {
    count[a.A.key] = (count[a.A.key] || 0) + 1;
    count[a.B.key] = (count[a.B.key] || 0) + 1;
  });
  const notable = [...CHART].sort((a, b) => (count[b.key] || 0) - (count[a.key] || 0)).slice(0, 4);

  return (
    <ScreenShell>
      {/* header — calm greeting + date */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="vela-label">{greeting}</div>
          <h1 className="mt-1.5 font-display text-[1.6rem] font-bold leading-tight text-txt">Hallo {firstName}</h1>
          <p className="mt-1 font-mono text-[12px] text-txt-2">{dateShort}</p>
        </div>
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogTrigger asChild>
            <button title="Hilfe" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-lilac active:scale-90">
              <HelpCircle className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <h2 className="font-display text-2xl font-bold text-txt">So liest du dein Rad</h2>
            <div className="mt-5 flex flex-col gap-4">
              {HELP_ITEMS.map((h) => (
                <div key={h.title} className="flex items-start gap-3.5">
                  <div className="vela-glyph flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-sm text-lilac">{h.icon}</div>
                  <div>
                    <div className="font-body text-[13px] font-medium text-ink/95">{h.title}</div>
                    <p className="mt-0.5 font-body text-xs font-light leading-relaxed text-ink/70">{h.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* HERO — big refined chart + editorial reading + slim dashboard, no boxes */}
      <section className="mt-8 lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-12">
        {/* chart: first on mobile, right on desktop */}
        <div className="order-1 mx-auto w-full max-w-[330px] lg:order-2 lg:max-w-none">
          <ChartWheel />
        </div>

        {/* editorial reading + dashboard */}
        <div className="order-2 mt-10 min-w-0 lg:order-1 lg:mt-0">
          <div className="font-mono text-[11px] tracking-[0.04em] text-mint">HEUTE · {dateShort}</div>
          <h2 className="mt-3 font-display text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.06] tracking-[-0.02em] text-txt">
            {IMPULSE.title}
          </h2>
          <p className="mt-4 max-w-[42ch] font-body text-[15px] leading-relaxed text-txt-2">{IMPULSE.txt}</p>
          <div className="vela-data mt-4">{ephemeris}</div>
          <div className="mt-5">
            <KlartextToggle />
          </div>

          {/* slim dashboard — the few values that matter, no box */}
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 border-t border-line-soft pt-6">
            {dash.map((d) => {
              const inner = (
                <>
                  <div className="vela-label !text-[0.55rem]">{d.label}</div>
                  <div className="mt-1 font-display text-[15px] font-bold text-txt">{signName(d.lon)}</div>
                  <div className="font-mono text-[11px] text-txt-2">
                    {SG[sgi(d.lon)]} {pad(deg(d.lon))}°
                  </div>
                </>
              );
              return d.sheet ? (
                <button key={d.label} onClick={() => openDetail(d.sheet!)} className="text-left transition hover:opacity-70">
                  {inner}
                </button>
              ) : (
                <div key={d.label}>{inner}</div>
              );
            })}
          </div>

          {/* Klartext-Begriffe — tap any dotted term for a plain explanation */}
          <p className="mt-5 max-w-[44ch] font-body text-[12px] leading-relaxed text-txt-3">
            Neu hier? Tippe unterstrichene Begriffe wie <Term k="mondknoten">Mondknoten</Term>,{" "}
            <Term k="aszendent">Aszendent</Term> oder <Term k="haus">Haus</Term> — du bekommst sie sofort in Klartext.
          </p>
        </div>
      </section>

      {/* notable positions — cards into a detail page */}
      <section className="mt-12">
        <SectionHead label="Deine auffälligsten Positionen" title="Wo dein Himmel am lautesten spricht" sub="Tippe für die ganze Deutung" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {notable.map((p) => (
            <PlanetCard
              key={p.key}
              k={p.key}
              glyph={p.glyph}
              name={p.name}
              meta={`${SG[sgi(p.lon)]} ${pad(deg(p.lon))}° · H${p.house ?? houseOf(p.lon)}`}
              role={PINFO[p.key].role}
            />
          ))}
        </div>
      </section>

      {/* today's sky */}
      <section className="mt-10">
        <SectionHead label="Heute am Himmel" title="Was dich heute bewegt" sub="Tippe für alle Transite" />
        <button onClick={() => setTab("transite")} className="vela-tile vela-tile-hover flex w-full items-center gap-3.5 p-4 text-left">
          <span className="vela-glyph text-2xl text-lilac">{TRANSITS[0].tg}</span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm font-semibold text-txt">{TRANSITS[0].title}</div>
            <p className="mt-1 line-clamp-2 font-body text-xs font-light text-txt-2">{TRANSITS[0].txt}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-txt-3" />
        </button>
      </section>

      {/* all positions — plain list, no box */}
      <section className="mt-10">
        <PositionsTable />
      </section>

      {/* houses */}
      <section className="mt-10">
        <SectionHead label="Deine Häuser" title="Wo dein Leben geschieht" sub="12 Lebensbereiche" />
        <HouseGrid />
      </section>

      {/* signs */}
      <section className="mt-10">
        <SectionHead label="Zeichen & Knoten" title="Deine Prägungen" sub="Tippe für die Bedeutung" />
        <SignChips />
      </section>
    </ScreenShell>
  );
}
