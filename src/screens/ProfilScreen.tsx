import { ChevronRight, Calendar, Clock, MapPin, Compass, Sparkles } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { GlassPanel } from "@/components/GlassPanel";
import { OrbImage } from "@/components/OrbImage";
import { Explainable } from "@/components/Explainable";
import { KlartextToggle } from "@/components/KlartextToggle";
import { StatChip, StatRow } from "@/components/Stat";
import { ASC, CHART, MC, PROFILE, SG, signName } from "@/lib/data";
import { useApp, type SavedBirth } from "@/store/useApp";
import { cn } from "@/lib/utils";

const deg = (lon: number) => Math.floor(((lon % 30) + 30) % 30);
const sgi = (lon: number) => Math.floor(((((lon % 360) + 360) % 360) / 30));
const pad = (n: number) => String(n).padStart(2, "0");

const MONTHS_ABBR = ["Jan", "Feb", "März", "Apr", "Mai", "Juni", "Juli", "Aug", "Sep", "Okt", "Nov", "Dez"];

const DEMO_BIRTH_ROWS = [
  { icon: <Calendar className="h-4 w-4" />, label: "7. Sep 1987", value: "Geburtsdatum" },
  { icon: <Clock className="h-4 w-4" />, label: "18:50", value: "Uhrzeit" },
  { icon: <MapPin className="h-4 w-4" />, label: "Starnberg", value: "Geburtsort" },
  { icon: <Compass className="h-4 w-4" />, label: "48°00′N · 11°21′E", value: "Koordinaten" },
];

function birthRows(saved: SavedBirth | null) {
  if (!saved) return DEMO_BIRTH_ROWS;
  const [y, mo, d] = saved.date.split("-").map(Number);
  return [
    { icon: <Calendar className="h-4 w-4" />, label: `${d}. ${MONTHS_ABBR[mo - 1]} ${y}`, value: "Geburtsdatum" },
    { icon: <Clock className="h-4 w-4" />, label: saved.time, value: "Uhrzeit" },
    { icon: <MapPin className="h-4 w-4" />, label: saved.place.split(",")[0], value: "Geburtsort" },
    { icon: <Compass className="h-4 w-4" />, label: `${saved.lat.toFixed(2)}° · ${saved.lon.toFixed(2)}°`, value: "Koordinaten" },
  ];
}

const SETTINGS = ["Benachrichtigungen", "Darstellung", "Datenschutz", "Über Vela"];

export function ProfilScreen() {
  const setOnboardingOpen = useApp((s) => s.setOnboardingOpen);
  const saved = useApp((s) => s.savedBirth);
  const BIRTH_ROWS = birthRows(saved);
  const big = [
    { key: "sun", label: "Sonne", glyph: "☉", lon: CHART[0].lon },
    { key: "moon", label: "Mond", glyph: "☽", lon: CHART[1].lon },
    { key: "asc", label: "Aszendent", glyph: "AC", lon: ASC },
    { key: "mc", label: "MC", glyph: "MC", lon: MC, noSheet: true },
  ];

  return (
    <ScreenShell>
      {/* avatar + name */}
      <div className="flex items-center gap-4">
        <OrbImage size={72} float={false} />
        <div className="min-w-0">
          <div className="vela-label mb-1.5">Dein Profil</div>
          <h1 className="font-display text-2xl font-bold leading-tight text-txt">{PROFILE.name}</h1>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_6px_#2dd4bf]" />
            <span className="font-mono text-[11px] text-txt-2">{PROFILE.memberSince}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <KlartextToggle />
      </div>

      {/* birth data — stat chips */}
      <StatRow className="mt-6">
        {BIRTH_ROWS.map((r) => (
          <StatChip key={r.value} icon={r.icon} label={r.label} value={r.value} className="min-w-[44%]" />
        ))}
      </StatRow>

      {/* compute / edit own chart */}
      <button
        onClick={() => setOnboardingOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cta-gradient px-5 py-3.5 font-display text-[14px] font-semibold text-space-2 shadow-glow transition active:scale-[0.98]"
      >
        <Sparkles className="h-4 w-4" />
        {saved ? "Geburtsdaten ändern" : "Eigenes Chart berechnen"}
      </button>

      {/* angles & lights */}
      <section className="mt-8">
        <SectionHead title="Deine Achsen & Lichter" sub="Tippe für die Bedeutung" />
        <div className="grid grid-cols-4 gap-2.5">
          {big.map((b) =>
            b.noSheet ? (
              <div key={b.key} className="vela-card-soft flex flex-col items-center gap-1 px-2 py-3.5">
                <span className="vela-glyph text-lg text-lilac">{b.glyph}</span>
                <span className="font-body text-[10px] uppercase tracking-wide text-txt-2">{b.label}</span>
                <span className="font-display text-[13px] font-semibold text-txt">{signName(b.lon)}</span>
                <span className="font-mono text-[10px] text-txt-3">{SG[sgi(b.lon)]} {pad(deg(b.lon))}°</span>
              </div>
            ) : (
              <Explainable key={b.key} sheet={{ kind: "planet", key: b.key }}>
                <div className="vela-card-soft flex flex-col items-center gap-1 px-2 py-3.5">
                  <span className="vela-glyph text-lg text-lilac">{b.glyph}</span>
                  <span className="font-body text-[10px] uppercase tracking-wide text-txt-2">{b.label}</span>
                  <span className="font-display text-[13px] font-semibold text-txt">{signName(b.lon)}</span>
                  <span className="font-mono text-[10px] text-txt-3">{SG[sgi(b.lon)]} {pad(deg(b.lon))}°</span>
                </div>
              </Explainable>
            ),
          )}
        </div>
      </section>

      {/* settings */}
      <section className="mt-8">
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
                <span className="rounded-pill border border-line px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-txt-3">Bald</span>
                <ChevronRight className="h-4 w-4 text-txt-3" />
              </span>
            </div>
          ))}
        </GlassPanel>
      </section>
    </ScreenShell>
  );
}
