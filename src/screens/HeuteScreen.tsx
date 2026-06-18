import { HelpCircle, ChevronRight } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { GlassPanel } from "@/components/GlassPanel";
import { IridescentOrb } from "@/components/IridescentOrb";
import { PlanetImage } from "@/components/PlanetImage";
import { Explainable } from "@/components/Explainable";
import { ChartWheel } from "@/components/ChartWheel";
import { KlartextToggle } from "@/components/KlartextToggle";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/useApp";
import {
  ASC,
  CHART,
  HOUSE,
  IMPULSE,
  NODES,
  PINFO,
  PROFILE,
  SG,
  SN,
  TRANSITS,
  houseOf,
  signName,
} from "@/lib/data";
import { PLANET_COLORS } from "@/lib/tokens";
import marsSrc from "@/assets/planet-mars.webp";
import moonSrc from "@/assets/planet-moon.webp";
import exoSrc from "@/assets/planet-exo.webp";

const HELP_ITEMS = [
  { icon: "✦", title: "Tippe alles, was leuchtet", body: "Jeder Planet, jede Linie, jedes Haus öffnet eine Erklärung in Klartext." },
  { icon: "☉", title: "Dein Geburtsrad", body: "Der innere Kreis zeigt deine Planeten, der äußere die Sternzeichen." },
  { icon: "△", title: "Die Linien", body: "Verbindungen zwischen Planeten — wie deine Kräfte miteinander sprechen." },
  { icon: "↑", title: "Frag dein Horoskop", body: "Unten rechts kannst du jederzeit eine Frage stellen — Vela antwortet aus deinem Chart." },
];

const deg = (lon: number) => Math.floor(((lon % 30) + 30) % 30);

function BigThree() {
  const cards = [
    { key: "sun", img: marsSrc, label: "Sonne", sign: signName(CHART[0].lon), d: deg(CHART[0].lon), accent: false },
    { key: "moon", img: moonSrc, label: "Mond", sign: signName(CHART[1].lon), d: deg(CHART[1].lon), accent: false },
    { key: "asc", img: exoSrc, label: "Aszendent", sign: signName(ASC), d: deg(ASC), accent: true },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((c) => (
        <Explainable key={c.key} sheet={{ kind: "planet", key: c.key }}>
          <div className="vela-card-soft px-2 pb-4 pt-3 text-center active:scale-[0.98]">
            <PlanetImage src={c.img} size={62} className="mx-auto" />
            <div className="vela-label mt-2 !text-[0.58rem]">{c.label}</div>
            <div
              className="mt-0.5 font-display text-base font-bold"
              style={{ color: c.accent ? PLANET_COLORS.asc : "#ece6f6" }}
            >
              {c.sign}
            </div>
            <div className="font-body text-[11px] text-ink-soft/45">{c.d}°</div>
          </div>
        </Explainable>
      ))}
    </div>
  );
}

function PlanetStrip() {
  return (
    <div className="-mx-[max(20px,5vw)] flex gap-3 overflow-x-auto px-[max(20px,5vw)] pb-2">
      {CHART.map((p) => {
        const col = PLANET_COLORS[p.key] || "#cbb8ff";
        return (
          <Explainable key={p.key} sheet={{ kind: "planet", key: p.key }} className="shrink-0">
            <GlassPanel className="w-[176px] p-4" interactive>
              <IridescentOrb size={44} glyph={p.glyph} glyphColor={col} />
              <div className="vela-serif mt-3 text-lg font-medium text-ink">{p.name}</div>
              <div className="vela-label mt-1 !tracking-[0.1em]" style={{ color: `${col}cc` }}>
                {signName(p.lon)} · Haus {houseOf(p.lon)}
              </div>
              <p className="vela-keyword mt-2 leading-relaxed">
                {PINFO[p.key].role}
              </p>
            </GlassPanel>
          </Explainable>
        );
      })}
    </div>
  );
}

function HouseGrid() {
  return (
    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3 xl:grid-cols-1">
      {HOUSE.map((name, i) => {
        const h = i + 1;
        const ps = CHART.filter((p) => houseOf(p.lon) === h);
        const occ = ps.length > 0;
        return (
          <Explainable key={h} sheet={{ kind: "house", key: h }}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3",
                occ ? "vela-card-soft" : "vela-glass",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold",
                  occ ? "bg-violet/25 text-lilac" : "bg-surface text-txt-2",
                )}
              >
                {h}
              </div>
              <div
                className={cn("min-w-0 flex-1 font-body text-sm", occ ? "text-txt" : "text-txt-2")}
              >
                {name}
              </div>
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
        <div className="vela-glass flex items-center gap-2 rounded-pill px-3.5 py-2.5">
          <span className="vela-glyph text-lilac">{SG[i]}</span>
          <span className="font-body text-xs text-ink-soft/85">{name}</span>
          <span className="vela-glyph text-xs text-ink-soft/55">{ps.map((p) => p.glyph).join("")}</span>
        </div>
      </Explainable>
    );
  });
  const nodeChips = NODES.map((n) => (
    <Explainable key={n.key} sheet={{ kind: "node", key: n.key }} className="shrink-0">
      <div className="vela-glass flex items-center gap-2 rounded-pill px-3.5 py-2.5">
        <span className="vela-glyph text-planet-node">{n.glyph}</span>
        <span className="font-body text-xs text-ink-soft/65">{signName(n.lon)}</span>
      </div>
    </Explainable>
  ));
  return (
    <div className="-mx-[max(20px,5vw)] flex gap-2 overflow-x-auto px-[max(20px,5vw)] pb-2">
      {chips}
      {nodeChips}
    </div>
  );
}

export function HeuteScreen() {
  const showHelp = useApp((s) => s.showHelp);
  const setShowHelp = useApp((s) => s.setShowHelp);
  const setTab = useApp((s) => s.setTab);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 17 ? "Guten Tag" : "Guten Abend";
  const todayLabel = now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  const firstName = PROFILE.name.split(" ")[0];

  return (
    <ScreenShell>
      {/* header — caps label, serif name, meta, quiet help (prototype) */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="vela-label">{greeting}</div>
          <h1 className="mt-1.5 font-display text-[1.6rem] font-bold leading-tight text-ink">
            Hallo {firstName}
          </h1>
          <p className="mt-1 font-body text-[13px] capitalize text-ink-soft/55">{todayLabel}</p>
        </div>
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogTrigger asChild>
            <button
              title="Hilfe — so liest du dein Rad"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lilac/40 bg-white/[0.05] text-lilac active:scale-90"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <h2 className="vela-name !text-3xl">So liest du dein Rad</h2>
            <div className="mt-5 flex flex-col gap-4">
              {HELP_ITEMS.map((h) => (
                <div key={h.title} className="flex items-start gap-3.5">
                  <div className="vela-glyph flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-sm text-lilac">
                    {h.icon}
                  </div>
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

      {/* desktop dashboard: two columns on xl; natural stack on mobile */}
      <div className="mt-6 xl:grid xl:grid-cols-[1.25fr_1fr] xl:gap-8 xl:items-start">
        {/* primary column — the reading, today's influence, the chart */}
        <div className="flex min-w-0 flex-col gap-6">
          <div className="vela-card-grad p-6 lg:p-7">
            <span className="vela-watermark vela-glyph -right-4 -top-6 text-[140px]">{IMPULSE.glyph}</span>
            <div className="relative">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">
                Dein Tag · {IMPULSE.sign}
              </div>
              <h2 className="mt-2 font-display text-[26px] font-bold leading-[1.12] lg:text-[34px]">
                {IMPULSE.title}
              </h2>
              <p className="mt-3 font-body text-[14px] leading-relaxed text-white/85 lg:text-[15px]">
                {IMPULSE.txt}
              </p>
              <p className="mt-3 font-body text-[11px] leading-relaxed text-white/55">{IMPULSE.sub}</p>
            </div>
          </div>

          <KlartextToggle />

          <section>
            <SectionHead label="Heute am Himmel" title="Was dich heute bewegt" sub="Tippe für alle Transite" />
            <button
              onClick={() => setTab("transite")}
              className="vela-card-soft flex w-full items-center gap-3.5 p-4 text-left active:scale-[0.99]"
            >
              <span className="vela-glyph text-2xl" style={{ color: TRANSITS[0].c }}>
                {TRANSITS[0].tg}
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-semibold text-ink">{TRANSITS[0].title}</div>
                <p className="mt-1 line-clamp-2 font-body text-xs font-light text-ink/65">{TRANSITS[0].txt}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-soft/40" />
            </button>
          </section>

          <section>
            <SectionHead label="Dein Geburtsrad" title="Dein Himmel im Moment der Geburt" sub="Tippe einen Planeten oder eine Linie" />
            <div className="vela-chart-bg rounded-[28px]">
              <ChartWheel />
            </div>
          </section>
        </div>

        {/* secondary column — overview & exploration */}
        <div className="mt-6 flex min-w-0 flex-col gap-6 xl:mt-0">
          <section>
            <SectionHead label="Überblick" title="Deine großen Drei" sub="Sonne, Mond & dein Aszendent" />
            <BigThree />
          </section>

          <section>
            <SectionHead label="Deine Planeten" title="Die Kräfte in dir" sub="Tippe jeden Punkt für seine Bedeutung" />
            <PlanetStrip />
          </section>

          <section>
            <SectionHead label="Deine Häuser" title="Wo dein Leben geschieht" sub="12 Lebensbereiche" />
            <HouseGrid />
          </section>

          <section>
            <SectionHead label="Zeichen & Knoten" title="Deine Prägungen" sub="Tippe für die Bedeutung" />
            <SignChips />
          </section>
        </div>
      </div>
    </ScreenShell>
  );
}
