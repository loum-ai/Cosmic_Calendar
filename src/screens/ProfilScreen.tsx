import { ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { GlassPanel } from "@/components/GlassPanel";
import { OrbImage } from "@/components/OrbImage";
import { Explainable } from "@/components/Explainable";
import { KlartextToggle } from "@/components/KlartextToggle";
import { StatChip, StatRow } from "@/components/Stat";
import { ASC, CHART, PROFILE, signName } from "@/lib/data";
import { PLANET_COLORS } from "@/lib/tokens";
import { cn } from "@/lib/utils";

const BIRTH_ROWS = [
  { icon: <Calendar className="h-4 w-4" />, label: "14. März 1996", value: "Geburtsdatum" },
  { icon: <Clock className="h-4 w-4" />, label: "07:42", value: "Uhrzeit" },
  { icon: <MapPin className="h-4 w-4" />, label: "Lissabon", value: "Geburtsort" },
];

const SETTINGS = ["Geburtsdaten bearbeiten", "Benachrichtigungen", "Darstellung", "Datenschutz", "Über Vela"];

export function ProfilScreen() {
  const big = [
    { key: "sun", label: "Sonne", sign: signName(CHART[0].lon), color: PLANET_COLORS.sun, glyph: "☉" },
    { key: "moon", label: "Mond", sign: signName(CHART[1].lon), color: PLANET_COLORS.moon, glyph: "☽" },
    { key: "asc", label: "Aszendent", sign: signName(ASC), color: PLANET_COLORS.asc, glyph: "AC" },
  ];

  return (
    <ScreenShell>
      {/* avatar + name (calm, not a giant name) */}
      <div className="flex items-center gap-4">
        <OrbImage size={72} float={false} />
        <div className="min-w-0">
          <div className="vela-label mb-1.5">Dein Profil</div>
          <h1 className="font-display text-2xl font-bold leading-tight text-txt">{PROFILE.name}</h1>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_6px_#2dd4bf]" />
            <span className="font-body text-xs text-txt-2">{PROFILE.memberSince}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <KlartextToggle />
      </div>

      {/* birth data — as stat chips */}
      <StatRow className="mt-6">
        {BIRTH_ROWS.map((r) => (
          <StatChip key={r.value} icon={r.icon} label={r.label} value={r.value} className="min-w-[30%]" />
        ))}
      </StatRow>

      {/* big three */}
      <section className="mt-7">
        <SectionHead title="Deine großen Drei" sub="Tippe für die Bedeutung" />
        <div className="flex gap-2.5">
          {big.map((b) => (
            <Explainable key={b.key} sheet={{ kind: "planet", key: b.key }} className="flex-1">
              <div className="vela-card-soft flex flex-col items-center gap-1 px-3 py-3.5">
                <span className="vela-glyph text-lg" style={{ color: b.color }}>
                  {b.glyph}
                </span>
                <span className="font-body text-[10px] uppercase tracking-wide text-txt-2">{b.label}</span>
                <span className="font-display text-xs font-semibold text-txt">{b.sign}</span>
              </div>
            </Explainable>
          ))}
        </div>
      </section>

      {/* settings */}
      <section className="mt-7">
        <SectionHead title="Einstellungen" />
        <GlassPanel className="p-1">
          {SETTINGS.map((s, i) => (
            <div
              key={s}
              className={cn(
                "flex w-full items-center justify-between px-4 py-3.5 text-left",
                i && "border-t border-line-soft",
              )}
            >
              <span className="font-body text-[13px] text-ink/85">{s}</span>
              <span className="flex items-center gap-2">
                <span className="rounded-pill border border-line px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-txt-3">
                  Bald
                </span>
                <ChevronRight className="h-4 w-4 text-txt-3" />
              </span>
            </div>
          ))}
        </GlassPanel>
      </section>
    </ScreenShell>
  );
}
