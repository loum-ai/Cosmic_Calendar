import { HelpCircle, ChevronRight } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { IridescentOrb } from "@/components/IridescentOrb";
import { Explainable } from "@/components/Explainable";
import { ChartWheel } from "@/components/ChartWheel";
import { PositionsTable } from "@/components/PositionsTable";
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

const HELP_ITEMS = [
  { icon: "✦", title: "Tippe alles, was leuchtet", body: "Jeder Planet, jede Linie, jedes Haus öffnet eine Erklärung in Klartext." },
  { icon: "☉", title: "Dein Geburtsrad", body: "Der innere Kreis zeigt deine Planeten, der äußere die Sternzeichen." },
  { icon: "△", title: "Die Linien", body: "Verbindungen zwischen Planeten — wie deine Kräfte miteinander sprechen." },
  { icon: "↑", title: "Frag dein Horoskop", body: "Unten rechts kannst du jederzeit eine Frage stellen — Vela antwortet aus deinem Chart." },
];

const deg = (lon: number) => Math.floor(((lon % 30) + 30) % 30);
const sg = (lon: number) => SG[Math.floor(((((lon % 360) + 360) % 360) / 30))];
const pad = (n: number) => String(n).padStart(2, "0");
const pc = (key: string) => PLANET_COLORS[key] || "#c4b5ff";

/** One consistent planet tile used everywhere (no more clashing styles). */
function PlanetTile({ k, glyph, color, name, meta, role }: { k: string; glyph: string; color: string; name: string; meta: string; role?: string }) {
  return (
    <Explainable sheet={{ kind: "planet", key: k }} className="h-full">
      <div className="vela-glass flex h-full items-start gap-3 rounded-2xl p-4">
        <IridescentOrb size={40} glyph={glyph} glyphColor={color} />
        <div className="min-w-0">
          <div className="font-display text-[15px] font-semibold leading-tight text-txt">{name}</div>
          <div className="mt-0.5 font-mono text-[11px] leading-tight" style={{ color }}>
            {meta}
          </div>
          {role && <p className="vela-keyword mt-1.5">{role}</p>}
        </div>
      </div>
    </Explainable>
  );
}

function HouseGrid() {
  return (
    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3">
      {HOUSE.map((name, i) => {
        const h = i + 1;
        const ps = CHART.filter((p) => houseOf(p.lon) === h);
        const occ = ps.length > 0;
        return (
          <Explainable key={h} sheet={{ kind: "house", key: h }}>
            <div className={cn("flex items-center gap-3 rounded-2xl px-4 py-3", occ ? "vela-card-soft" : "vela-glass")}>
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold",
                  occ ? "bg-violet/25 text-lilac" : "bg-surface text-txt-2",
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
  return <div className="flex flex-wrap gap-2">{chips}{nodeChips}</div>;
}

export function HeuteScreen() {
  const showHelp = useApp((s) => s.showHelp);
  const setShowHelp = useApp((s) => s.setShowHelp);
  const setTab = useApp((s) => s.setTab);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 17 ? "Guten Tag" : "Guten Abend";
  const todayLabel = now.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  const dateShort = now.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const firstName = PROFILE.name.split(" ")[0];
  const ephemeris = `☉ ${sg(CHART[0].lon)} ${pad(deg(CHART[0].lon))}°    ☽ ${sg(CHART[1].lon)} ${pad(deg(CHART[1].lon))}°    AC ${sg(ASC)} ${pad(deg(ASC))}°`;

  const bigThree = [
    { k: "sun", glyph: "☉", color: pc("sun"), label: "Sonne", sign: signName(CHART[0].lon), d: deg(CHART[0].lon) },
    { k: "moon", glyph: "☽", color: pc("moon"), label: "Mond", sign: signName(CHART[1].lon), d: deg(CHART[1].lon) },
    { k: "asc", glyph: "AC", color: pc("asc"), label: "Aszendent", sign: signName(ASC), d: deg(ASC) },
  ];

  return (
    <ScreenShell>
      {/* header — calm greeting + date, never the giant name */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="vela-label">{greeting}</div>
          <h1 className="mt-1.5 font-display text-[1.6rem] font-bold leading-tight text-txt">Hallo {firstName}</h1>
          <p className="mt-1 font-body text-[13px] capitalize text-txt-2">{todayLabel}</p>
        </div>
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogTrigger asChild>
            <button
              title="Hilfe — so liest du dein Rad"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lilac/40 bg-surface text-lilac active:scale-90"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <h2 className="font-display text-2xl font-bold text-txt">So liest du dein Rad</h2>
            <div className="mt-5 flex flex-col gap-4">
              {HELP_ITEMS.map((h) => (
                <div key={h.title} className="flex items-start gap-3.5">
                  <div className="vela-glyph flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-sm text-lilac">
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

      {/* HERO — your birth chart, always on top; on desktop the chart is the
          immersive centrepiece with the reading + big three floating around it */}
      <section className="relative mt-6 lg:mt-4 lg:min-h-[580px]">
        <div className="vela-chart-bg mx-auto w-full max-w-[300px] lg:max-w-[560px]">
          <ChartWheel />
        </div>

        {/* daily reading — floats top-left over the chart on desktop */}
        <div className="mt-6 lg:absolute lg:left-0 lg:top-2 lg:mt-0 lg:w-[332px]">
          <div className="vela-card-grad p-6">
            <span className="vela-watermark vela-glyph -right-4 -top-6 text-[130px]">{IMPULSE.glyph}</span>
            <div className="relative">
              <div className="font-mono text-[11px] tracking-[0.04em] text-white/70">HEUTE · {dateShort}</div>
              <h2 className="mt-2.5 font-display text-[26px] font-bold leading-[1.12] lg:text-[30px]">{IMPULSE.title}</h2>
              <p className="mt-3 font-body text-[14px] leading-relaxed text-white/85">{IMPULSE.txt}</p>
              <div className="my-4 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0.28),transparent)]" />
              <div className="font-mono text-[11px] leading-relaxed text-white/80">{ephemeris}</div>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/45">{IMPULSE.sub}</p>
            </div>
          </div>
          <div className="mt-3">
            <KlartextToggle />
          </div>
        </div>

        {/* big three — float top-right over the chart on desktop, 3-up on mobile */}
        <div className="mt-6 grid grid-cols-3 gap-3 lg:absolute lg:right-0 lg:top-2 lg:mt-0 lg:flex lg:w-[208px] lg:flex-col lg:gap-3">
          {bigThree.map((b) => (
            <Explainable key={b.k} sheet={{ kind: "planet", key: b.k }}>
              <div className="vela-glass flex h-full flex-col items-center gap-2 rounded-2xl px-3 py-4 text-center lg:flex-row lg:gap-3 lg:py-3 lg:text-left">
                <IridescentOrb size={40} glyph={b.glyph} glyphColor={b.color} />
                <div className="min-w-0">
                  <div className="vela-label !text-[0.55rem]">{b.label}</div>
                  <div className="font-display text-base font-bold leading-tight text-txt">{b.sign}</div>
                  <div className="font-mono text-[11px] text-txt-3">{pad(b.d)}°</div>
                </div>
              </div>
            </Explainable>
          ))}
        </div>
      </section>

      {/* the chart's data — collapsible positions table */}
      <section className="mt-8">
        <PositionsTable />
      </section>

      {/* below the hero */}
      <section className="mt-10">
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

      <section className="mt-9">
        <SectionHead label="Deine Planeten" title="Die Kräfte in dir" sub="Tippe jeden Punkt für seine Bedeutung" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {CHART.map((p) => (
            <PlanetTile
              key={p.key}
              k={p.key}
              glyph={p.glyph}
              color={pc(p.key)}
              name={p.name}
              meta={`${sg(p.lon)} ${pad(deg(p.lon))}° · H${houseOf(p.lon)}`}
              role={PINFO[p.key].role}
            />
          ))}
        </div>
      </section>

      <section className="mt-9">
        <SectionHead label="Deine Häuser" title="Wo dein Leben geschieht" sub="12 Lebensbereiche" />
        <HouseGrid />
      </section>

      <section className="mt-9">
        <SectionHead label="Zeichen & Knoten" title="Deine Prägungen" sub="Tippe für die Bedeutung" />
        <SignChips />
      </section>
    </ScreenShell>
  );
}
