import { ChevronRight } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { GlassPanel } from "@/components/GlassPanel";
import { CrystalGem } from "@/components/CrystalGem";
import { Explainable } from "@/components/Explainable";
import { KlartextToggle } from "@/components/KlartextToggle";
import { ASC, CHART, PROFILE, signName } from "@/lib/data";
import { PLANET_COLORS } from "@/lib/tokens";

const BIRTH_ROWS = [
  { label: "Geburtsdatum", value: "14. März 1996" },
  { label: "Uhrzeit", value: "07:42" },
  { label: "Ort", value: "Lissabon, Portugal" },
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
      {/* avatar + name */}
      <div className="flex items-center gap-4">
        <CrystalGem size={76} float={false} />
        <div className="min-w-0">
          <h1 className="font-serif text-4xl font-medium leading-none tracking-tight text-ink">
            {PROFILE.name}
          </h1>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_6px_#2fde8c]" />
            <span className="font-body text-xs text-ink-soft/55">{PROFILE.memberSince}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <KlartextToggle />
      </div>

      {/* birth data */}
      <GlassPanel className="mt-6 p-1">
        {BIRTH_ROWS.map((r, i) => (
          <div
            key={r.label}
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderTop: i ? "1px solid rgba(255,255,255,0.06)" : undefined }}
          >
            <span className="font-body text-[13px] text-ink-soft/55">{r.label}</span>
            <span className="font-body text-[13px] font-medium text-ink">{r.value}</span>
          </div>
        ))}
      </GlassPanel>

      {/* big three */}
      <section className="mt-7">
        <SectionHead title="Deine großen Drei" sub="Tippe für die Bedeutung" />
        <div className="flex gap-2.5">
          {big.map((b) => (
            <Explainable key={b.key} sheet={{ kind: "planet", key: b.key }} className="flex-1">
              <div
                className="flex flex-col items-center gap-1 rounded-pill border px-2 py-3"
                style={{ borderColor: `${b.color}55`, background: `${b.color}14` }}
              >
                <span className="vela-glyph text-lg" style={{ color: b.color }}>
                  {b.glyph}
                </span>
                <span className="font-body text-[10px] uppercase tracking-wide text-ink-soft/55">
                  {b.label}
                </span>
                <span className="font-display text-xs font-semibold text-ink">{b.sign}</span>
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
            <button
              key={s}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left transition active:bg-white/[0.04]"
              style={{ borderTop: i ? "1px solid rgba(255,255,255,0.06)" : undefined }}
            >
              <span className="font-body text-[13px] text-ink/85">{s}</span>
              <ChevronRight className="h-4 w-4 text-ink-soft/40" />
            </button>
          ))}
        </GlassPanel>
      </section>
    </ScreenShell>
  );
}
