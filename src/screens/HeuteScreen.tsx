import { HelpCircle } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { GlassPanel } from "@/components/GlassPanel";
import { IridescentOrb } from "@/components/IridescentOrb";
import { Explainable } from "@/components/Explainable";
import { ChartWheel } from "@/components/ChartWheel";
import { KlartextToggle } from "@/components/KlartextToggle";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  SIGNWHAT,
  SN,
  houseOf,
  signName,
} from "@/lib/data";
import { PLANET_COLORS } from "@/lib/tokens";

const HELP_ITEMS = [
  { icon: "✦", title: "Tippe alles, was leuchtet", body: "Jeder Planet, jede Linie, jedes Haus öffnet eine Erklärung in Klartext." },
  { icon: "☉", title: "Dein Geburtsrad", body: "Der innere Kreis zeigt deine Planeten, der äußere die Sternzeichen." },
  { icon: "△", title: "Die Linien", body: "Verbindungen zwischen Planeten — wie deine Kräfte miteinander sprechen." },
  { icon: "↑", title: "Frag dein Horoskop", body: "Unten rechts kannst du jederzeit eine Frage stellen — Vela antwortet aus deinem Chart." },
];

function BigThree() {
  const sunSign = signName(CHART[0].lon);
  const moonSign = signName(CHART[1].lon);
  const ascSign = signName(ASC);
  const cards = [
    { key: "sun", glyph: "☉", label: "Sonne", sign: sunSign, color: PLANET_COLORS.sun },
    { key: "moon", glyph: "☽", label: "Mond", sign: moonSign, color: PLANET_COLORS.moon },
    { key: "asc", glyph: "AC", label: "Aszendent", sign: ascSign, color: PLANET_COLORS.asc },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {cards.map((c) => (
        <Explainable key={c.key} sheet={{ kind: "planet", key: c.key }}>
          <GlassPanel className="px-2 py-3.5 text-center" interactive>
            <div className="vela-glyph text-xl" style={{ color: c.color }}>
              {c.glyph}
            </div>
            <div className="mt-1.5 font-body text-[11px] uppercase tracking-wide text-ink-soft/50">
              {c.label}
            </div>
            <div className="font-display text-sm font-semibold text-ink">{c.sign}</div>
          </GlassPanel>
        </Explainable>
      ))}
    </div>
  );
}

function PlanetStrip() {
  return (
    <div className="-mx-[max(16px,4vw)] flex gap-3 overflow-x-auto px-[max(16px,4vw)] pb-2">
      {CHART.map((p) => {
        const col = PLANET_COLORS[p.key] || "#e7dcff";
        return (
          <Explainable key={p.key} sheet={{ kind: "planet", key: p.key }} className="shrink-0">
            <GlassPanel className="w-[200px] p-4" interactive nebula>
              <div className="mb-3">
                <IridescentOrb size={56} glyph={p.glyph} glyphColor={col} float={false} spin />
              </div>
              <div className="font-display text-base font-bold text-ink">{p.name}</div>
              <div className="font-body text-[11px] uppercase tracking-wide" style={{ color: col }}>
                {signName(p.lon)} · Haus {houseOf(p.lon)}
              </div>
              <p className="mt-2 line-clamp-2 font-body text-xs font-light leading-relaxed text-ink/65">
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
            <div
              className="flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition"
              style={{
                background: occ ? "rgba(196,166,255,0.06)" : "rgba(255,255,255,0.02)",
                borderColor: occ ? "rgba(196,166,255,0.2)" : "rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                style={{
                  background: occ ? "#c4a6ff" : "rgba(255,255,255,0.06)",
                  color: occ ? "#180f2a" : "rgba(232,226,250,0.55)",
                }}
              >
                {h}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="font-display text-[15px]"
                  style={{ color: occ ? "#f1ecfb" : "rgba(232,226,250,0.55)", fontWeight: occ ? 600 : 400 }}
                >
                  {name}
                </div>
              </div>
              <div className="vela-glyph shrink-0 text-sm text-ink-soft/70">
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
        <div className="flex items-center gap-2 rounded-pill border border-lilac/25 bg-white/[0.06] px-3.5 py-2.5">
          <span className="vela-glyph text-lilac">{SG[i]}</span>
          <span className="font-body text-xs text-ink-soft/85">{name}</span>
          <span className="vela-glyph text-xs text-ink-soft/60">{ps.map((p) => p.glyph).join("")}</span>
        </div>
      </Explainable>
    );
  });
  const nodeChips = NODES.map((n) => (
    <Explainable key={n.key} sheet={{ kind: "node", key: n.key }} className="shrink-0">
      <div className="flex items-center gap-2 rounded-pill border border-planet-node/25 bg-white/[0.05] px-3.5 py-2.5">
        <span className="vela-glyph text-planet-node">{n.glyph}</span>
        <span className="font-body text-xs text-ink-soft/70">{signName(n.lon)}</span>
      </div>
    </Explainable>
  ));
  return (
    <div className="-mx-[max(16px,4vw)] flex gap-2 overflow-x-auto px-[max(16px,4vw)] pb-2">
      {chips}
      {nodeChips}
    </div>
  );
}

export function HeuteScreen() {
  const showHelp = useApp((s) => s.showHelp);
  const setShowHelp = useApp((s) => s.setShowHelp);
  const sunSign = signName(CHART[0].lon);
  const lead = `Dein Sternzeichen ist ${sunSign}. ${SIGNWHAT[SN.indexOf(sunSign)]}`;

  return (
    <ScreenShell>
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="vela-display">{PROFILE.name}</h1>
          <p className="mt-1.5 font-body text-xs text-ink-soft/50">{PROFILE.birth}</p>
        </div>
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogTrigger asChild>
            <button
              title="Hilfe — so liest du dein Rad"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lilac/45 bg-white/[0.06] text-lilac active:scale-90"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <h2 className="font-display text-2xl font-medium text-ink">So liest du dein Rad</h2>
            <div className="mt-5 flex flex-col gap-4">
              {HELP_ITEMS.map((h) => (
                <div key={h.title} className="flex items-start gap-3.5">
                  <div className="vela-glyph flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-sm text-lilac">
                    {h.icon}
                  </div>
                  <div>
                    <div className="font-body text-[13px] font-medium text-ink/95">{h.title}</div>
                    <p className="mt-0.5 font-body text-xs font-light leading-relaxed text-ink/70">
                      {h.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-3">
        <KlartextToggle />
      </div>

      {/* editorial hero */}
      <GlassPanel className="mt-5 p-5" nebula>
        <div className="absolute -right-3 -top-2 opacity-90">
          <IridescentOrb size={88} glyph={IMPULSE.glyph} />
        </div>
        <div className="relative max-w-[78%]">
          <div className="vela-eyebrow mb-2.5 text-mint-soft">Dein heutiger Impuls</div>
          <h3 className="font-display text-2xl font-extrabold leading-tight text-ink text-balance">
            {lead}
          </h3>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-lilac/35 to-transparent" />
            <span className="font-body text-[11px] text-lilac/55">Jupiter · Neptun aktiv</span>
          </div>
        </div>
      </GlassPanel>

      {/* geburtsrad */}
      <section className="mt-8">
        <SectionHead title="Dein Geburtsrad" sub="Tippe einen Planeten oder eine Linie" />
        <ChartWheel />
      </section>

      {/* überblick */}
      <section className="mt-8">
        <SectionHead title="Überblick" sub="Sonne, Mond & dein Aszendent" />
        <BigThree />
      </section>

      {/* planeten */}
      <section className="mt-8">
        <SectionHead title="Deine Planeten" sub="Tippe jeden Punkt für seine Bedeutung" />
        <PlanetStrip />
      </section>

      {/* häuser */}
      <section className="mt-8">
        <SectionHead title="Deine Häuser" sub="12 Bereiche, wo dein Leben geschieht" />
        <HouseGrid />
      </section>

      {/* zeichen & knoten */}
      <section className="mt-8">
        <SectionHead title="Zeichen & Knoten" sub="Deine kosmischen Prägungen" />
        <SignChips />
      </section>
    </ScreenShell>
  );
}
