import { HelpCircle, ArrowUp } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { GlassPanel } from "@/components/GlassPanel";
import { IridescentOrb } from "@/components/IridescentOrb";
import { OrbImage } from "@/components/OrbImage";
import { PlanetImage } from "@/components/PlanetImage";
import { Explainable } from "@/components/Explainable";
import { ChartWheel } from "@/components/ChartWheel";
import { KlartextToggle } from "@/components/KlartextToggle";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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

const HERO_PILLS = ["Was macht mich aus?", "Wie liebe ich?", "Wo liegt meine Kraft?"];

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
          <GlassPanel className="px-2 pb-4 pt-3 text-center" interactive>
            <PlanetImage src={c.img} size={62} className="mx-auto" />
            <div className="vela-label mt-2 !text-[0.58rem]">{c.label}</div>
            <div
              className="mt-0.5 font-display text-base font-bold"
              style={{ color: c.accent ? PLANET_COLORS.asc : "#ece6f6" }}
            >
              {c.sign}
            </div>
            <div className="font-body text-[11px] text-ink-soft/45">{c.d}°</div>
          </GlassPanel>
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
    <div className="flex flex-col gap-2">
      {HOUSE.map((name, i) => {
        const h = i + 1;
        const ps = CHART.filter((p) => houseOf(p.lon) === h);
        const occ = ps.length > 0;
        return (
          <Explainable key={h} sheet={{ kind: "house", key: h }}>
            <div className="vela-glass flex items-center gap-3 rounded-2xl px-4 py-3">
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold"
                style={{
                  background: occ ? "rgba(196,166,255,0.16)" : "rgba(255,255,255,0.04)",
                  color: occ ? PLANET_COLORS.asc : "rgba(232,226,250,0.4)",
                }}
              >
                {h}
              </div>
              <div
                className="min-w-0 flex-1 font-body text-sm"
                style={{ color: occ ? "#ece6f6" : "rgba(232,226,250,0.5)" }}
              >
                {name}
              </div>
              <div className="vela-glyph shrink-0 text-sm text-ink-soft/65">
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
  const setComposerOpen = useApp((s) => s.setComposerOpen);
  const ask = useApp((s) => s.ask);

  return (
    <ScreenShell>
      {/* header — caps label, serif name, meta, quiet help (prototype) */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="vela-label">Geburtshoroskop</div>
          <h1 className="vela-name mt-1.5">{PROFILE.name}</h1>
          <p className="mt-2 font-body text-[11px] uppercase tracking-[0.08em] text-ink-soft/45">
            14 · 03 · 1996 · 07:42 · Lissabon
          </p>
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

      {/* hero — loum.ai oracle look: ghosted lead + glowing wide-tracked
          headline, luminous orb, suggestion pills and a glowing ask bar */}
      <section className="relative mt-6 flex flex-col items-center px-2 text-center">
        <div className="vela-oracle-ghost">Impuls des Tages</div>
        <h1 className="vela-oracle-head mt-2 max-w-[15ch]">{IMPULSE.title}</h1>

        <OrbImage size={172} className="my-7" />

        <p className="vela-body max-w-[32ch]">{IMPULSE.txt}</p>

        {/* suggestion pills — seed the composer */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {HERO_PILLS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setComposerOpen(true);
                void ask(p);
              }}
              className="rounded-pill border border-lilac/30 bg-white/[0.06] px-3.5 py-2 font-body text-[12px] text-ink-soft/85 backdrop-blur-md transition hover:border-lilac/50 active:scale-95"
            >
              {p}
            </button>
          ))}
        </div>

        {/* glowing ask bar — opens the composer */}
        <button onClick={() => setComposerOpen(true)} className="vela-askbar mt-4">
          <span>Frag dein Horoskop…</span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cta-gradient text-white">
            <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
          </span>
        </button>

        <div className="mt-6">
          <KlartextToggle />
        </div>
      </section>

      <section>
        <SectionHead label="Dein Geburtsrad" title="Dein Himmel im Moment der Geburt" sub="Tippe einen Planeten oder eine Linie" />
        <div className="vela-chart-bg rounded-[28px]">
          <ChartWheel />
        </div>
      </section>

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
    </ScreenShell>
  );
}
