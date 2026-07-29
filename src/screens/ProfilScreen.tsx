import { ChevronRight, Calendar, Clock, MapPin, Compass, Pencil, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { OrbImage } from "@/components/OrbImage";
import { Explainable } from "@/components/Explainable";
import { KlartextToggle } from "@/components/KlartextToggle";
import { ASC, CHART, IS_DEMO, MC, PROFILE, SG, signName } from "@/lib/data";
import { chartPatterns, type Pattern } from "@/lib/patterns";
import { useReading } from "@/lib/genReadings";
import { aiSummary, getVerification } from "@/lib/interpret";
import { useApp, type SavedBirth, type ViewerBirth } from "@/store/useApp";
import { cn } from "@/lib/utils";

const deg = (lon: number) => Math.floor(((lon % 30) + 30) % 30);
const sgi = (lon: number) => Math.floor(((((lon % 360) + 360) % 360) / 30));
const pad = (n: number) => String(n).padStart(2, "0");

const MONTHS_ABBR = ["Jan", "Feb", "März", "Apr", "Mai", "Juni", "Juli", "Aug", "Sep", "Okt", "Nov", "Dez"];

// Nur für das mitgelieferte Beispiel-Chart. NIE als Rückfallebene für einen
// echten Kunden — sonst stehen im Klienten-Link fremde Geburtsdaten.
const DEMO_BIRTH_ROWS = [
  { icon: <Calendar className="h-4 w-4" />, label: "7. Sep 1987", value: "Geburtsdatum" },
  { icon: <Clock className="h-4 w-4" />, label: "18:50", value: "Uhrzeit" },
  { icon: <MapPin className="h-4 w-4" />, label: "Starnberg", value: "Geburtsort" },
  { icon: <Compass className="h-4 w-4" />, label: "48°00′N · 11°21′E", value: "Koordinaten" },
];

/** Geburtsdaten-Zeilen: eigenes gespeichertes Chart → Klienten-Link → Demo.
 *  Ohne eigene UND ohne Klienten-Daten bleibt die Karte leer statt falsch. */
function birthRows(saved: SavedBirth | null, viewer: ViewerBirth | null) {
  const b = saved
    ? { date: saved.date, time: saved.time, place: saved.place, lat: saved.lat, lon: saved.lon }
    : viewer
      ? { date: viewer.date, time: viewer.time, place: viewer.place, lat: viewer.lat, lon: viewer.lon }
      : null;
  if (!b) return IS_DEMO ? DEMO_BIRTH_ROWS : [];
  const [y, mo, d] = b.date.split("-").map(Number);
  const coords = b.lat != null && b.lon != null ? `${Number(b.lat).toFixed(2)}° · ${Number(b.lon).toFixed(2)}°` : null;
  return [
    { icon: <Calendar className="h-4 w-4" />, label: `${d}. ${MONTHS_ABBR[mo - 1]} ${y}`, value: "Geburtsdatum" },
    { icon: <Clock className="h-4 w-4" />, label: b.time || "unbekannt", value: "Uhrzeit" },
    { icon: <MapPin className="h-4 w-4" />, label: (b.place || "—").split(",")[0], value: "Geburtsort" },
    ...(coords ? [{ icon: <Compass className="h-4 w-4" />, label: coords, value: "Koordinaten" }] : []),
  ];
}

const SETTINGS = ["Benachrichtigungen", "Darstellung", "Datenschutz", "Über Vela"];

/** Signatur-Karte: Überschrift = das Muster, Text = die erzeugte Deutung dazu
 *  (die Beobachtung p.text steht als Rückfallebene, solange sie lädt).
 *  Regel 1+2: solide Ink-Karte mit Inset-Hairline, Cinzel flach uppercase. */
function SignaturCard({ p }: { p: Pattern }) {
  const { text: gen } = useReading(p.viewKey, p.task, !IS_DEMO);
  return (
    <div className="vela-card-soft p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="vela-glyph text-[13px] leading-none text-lilac">{p.glyphs.join(" ")}</span>
        <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-txt-3">Signatur</span>
      </div>
      <h3 className="font-body text-body font-semibold uppercase leading-[1.16] tracking-[0.02em] text-txt">{p.human}</h3>
      <p className="mt-2 line-clamp-3 font-body text-[13px] leading-[1.62] text-txt-2">{gen || p.text}</p>
    </div>
  );
}

/**
 * Regel 5 — Textwände auflösen: lange Deutungen werden in Absätze gebrochen.
 * Erst an echten Zeilenumbrüchen, sonst an Satzgrenzen zu ~320-Zeichen-Blöcken.
 * Rein darstellend: der Text selbst bleibt unverändert.
 */
function paragraphs(text: string): string[] {
  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  const t = lines[0] ?? "";
  if (t.length <= 400) return t ? [t] : [];
  const sentences = t.match(/[^.!?…]+[.!?…]*\s*/g) ?? [t];
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    buf += s;
    if (buf.length >= 320) {
      out.push(buf.trim());
      buf = "";
    }
  }
  const rest = buf.trim();
  if (rest) {
    if (out.length && rest.length < 90) out[out.length - 1] += " " + rest;
    else out.push(rest);
  }
  return out;
}

export function ProfilScreen() {
  const setOnboardingOpen = useApp((s) => s.setOnboardingOpen);
  const saved = useApp((s) => s.savedBirth);
  const viewerBirth = useApp((s) => s.viewerBirth);
  const viewer = useApp((s) => s.viewerMode);
  const aiVersion = useApp((s) => s.aiVersion);
  const aiLoading = useApp((s) => s.aiLoading);
  void aiVersion; // re-render when the interpretation lands
  const summary = aiSummary();
  const verify = getVerification();
  const BIRTH_ROWS = birthRows(saved, viewerBirth);
  const big = [
    { key: "sun", label: "Sonne", glyph: "☉", lon: CHART[0].lon },
    { key: "moon", label: "Mond", glyph: "☽", lon: CHART[1].lon },
    { key: "asc", label: "Aszendent", glyph: "AC", lon: ASC },
    { key: "mc", label: "MC", glyph: "MC", lon: MC, noSheet: true },
  ];

  return (
    <ScreenShell>
      {/* Kopf (Konzept ProfilScreen): Orb mit Puls-Halo, Name, Trio, Status */}
      <div className="mt-2 flex flex-col items-center gap-2 text-center">
        <span className="relative inline-flex">
          <span aria-hidden className="vela-orb-halo pointer-events-none absolute -inset-5 rounded-full" style={{ background: "radial-gradient(circle, rgba(var(--rgb-iris),.55), transparent 62%)", mixBlendMode: "plus-lighter" }} />
          <OrbImage size={104} float={false} />
        </span>
        <h1 className="mt-1 font-body text-h3 font-semibold leading-[1.08] text-txt">{PROFILE.name}</h1>
        <span className="font-body text-[11px] uppercase tracking-[0.18em] text-txt-3">
          {signName(CHART[0].lon)} · {signName(CHART[1].lon)} · {signName(ASC)}
        </span>
        {verify?.max_dev_arcsec != null && (
          <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-pill bg-mint/[0.07] px-3 py-[5px] font-body text-[11px] font-medium uppercase tracking-[0.14em] text-mint shadow-[inset_0_0_0_1px_rgba(32,240,208,0.28)]">
            <span className="h-[5px] w-[5px] rounded-full bg-mint shadow-[0_0_6px_rgba(32,240,208,0.8)]" />
            Daten geprüft · NOVAS
          </span>
        )}
      </div>

      {/* canonical signature — the two most defining whole-chart notes */}
      {(() => {
        const ps = chartPatterns().slice(0, 2);
        if (!ps.length) return null;
        return (
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {ps.map((p) => <SignaturCard key={p.id} p={p} />)}
          </div>
        );
      })()}

      <div className="mt-4">
        <KlartextToggle />
      </div>

      {/* Geburtsdaten — solide Ink-Karte mit Stift (Regel 1: kein Blur, kein
          Drop-Shadow, die einzige Kante ist die Inset-Hairline) */}
      {BIRTH_ROWS.length > 0 && (
      <div className="vela-card-soft mt-6 px-4 pb-3.5 pt-3.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="v-eyebrow">Geburtsdaten</span>
          {!viewer && saved && (
            <button onClick={() => setOnboardingOpen(true)} aria-label="Geburtsdaten bearbeiten" className="p-1 text-txt-3 transition hover:text-txt">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {BIRTH_ROWS.map((r) => (
          <div key={r.value} className="flex items-center justify-between border-t border-line-soft py-2.5 font-body text-[13px]">
            <span className="flex items-center gap-2 text-txt-3">{r.icon}{r.value}</span>
            <span className="text-txt">{r.label}</span>
          </div>
        ))}
        <p className="mt-2.5 font-body text-[11px] leading-relaxed text-txt-3">Nur für deine Deutungen gespeichert. Jederzeit löschbar.</p>
      </div>
      )}

      {/* Erst-Einrichtung — nur ohne gespeicherte Daten (Klienten-Links nie) */}
      {!viewer && !saved && (
        <button
          onClick={() => setOnboardingOpen(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 btn-moon px-5 py-3.5 font-display text-[15px] font-semibold transition active:scale-[0.98]"
        >
          <Sparkles className="h-4 w-4" />
          Erhalte dein Horoskop
        </button>
      )}

      {/* AI interpretation summary + data-verification badge */}
      <section className="mt-8">
        <SectionHead title="Deine Deutung" sub="Von Vela aus deinem echten Geburtsbild" />
        <div className="vela-card-soft px-[18px] pb-[18px] pt-[18px]">
          {summary ? (
            <div className="space-y-2.5">
              {paragraphs(summary).map((para, i) => (
                <p
                  key={i}
                  className={cn(
                    "font-body",
                    i === 0
                      ? "text-[15px] leading-[1.58] text-txt"
                      : "text-[13px] leading-[1.66] text-txt-2",
                  )}
                >
                  {para}
                </p>
              ))}
            </div>
          ) : aiLoading ? (
            <div className="flex items-center gap-2 text-txt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-body text-[13px]">Vela erstellt deine persönliche Deutung …</span>
            </div>
          ) : viewer ? (
            <p className="font-body text-[13px] leading-[1.62] text-txt-2">Deine persönliche Deutung wird gerade von deiner Astrologin vorbereitet.</p>
          ) : (
            <p className="font-body text-[13px] leading-[1.62] text-txt-2">Deine persönliche Deutung erstellt Vela aus deinem echten Geburtsbild — frag deine Astrologin nach deinem Zugang.</p>
          )}
          {verify?.max_dev_arcsec != null && (
            <div className="mt-4 flex items-center gap-1.5 border-t border-line-soft pt-3">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-mint" />
              <span className="font-body text-[11px] uppercase tracking-[0.12em] text-txt-3">
                Daten geprüft gegen NASA-NOVAS · Abweichung {verify.max_dev_arcsec}″
              </span>
            </div>
          )}
        </div>
      </section>

      {/* angles & lights */}
      <section className="mt-8">
        <SectionHead title="Sonne, Mond & Achsen" sub="Tippe für die Bedeutung" />
        <div className="grid grid-cols-4 gap-2.5">
          {big.map((b) =>
            b.noSheet ? (
              <div key={b.key} className="vela-card-soft flex flex-col items-center gap-1 px-2 py-4">
                <span className="vela-glyph text-lg leading-none text-lilac">{b.glyph}</span>
                <span className="mt-0.5 font-body text-[9.5px] font-medium uppercase tracking-[0.14em] text-txt-3">{b.label}</span>
                <span className="font-display text-[13px] font-semibold text-txt">{signName(b.lon)}</span>
                <span className="font-body text-[11px] text-txt-3">{SG[sgi(b.lon)]} {pad(deg(b.lon))}°</span>
              </div>
            ) : (
              <Explainable key={b.key} sheet={{ kind: "planet", key: b.key }}>
                <div className="vela-card-soft flex flex-col items-center gap-1 px-2 py-4">
                  <span className="vela-glyph text-lg leading-none text-lilac">{b.glyph}</span>
                  <span className="mt-0.5 font-body text-[9.5px] font-medium uppercase tracking-[0.14em] text-txt-3">{b.label}</span>
                  <span className="font-display text-[13px] font-semibold text-txt">{signName(b.lon)}</span>
                  <span className="font-body text-[11px] text-txt-3">{SG[sgi(b.lon)]} {pad(deg(b.lon))}°</span>
                </div>
              </Explainable>
            ),
          )}
        </div>
      </section>

      {/* settings */}
      <section className="mt-8">
        <SectionHead title="Einstellungen" />
        {/* Noch nichts davon ist gebaut — also sehen die Zeilen auch nicht aus
            wie Buttons: kein Chevron, gedämpfter Text, ehrliche „bald"-Pille. */}
        <div className="vela-card-soft px-1 py-1">
          {SETTINGS.map((s, i) => (
            <div
              key={s}
              className={cn(
                "flex w-full select-none items-center justify-between px-4 py-3.5 text-left",
                i && "border-t border-line-soft",
              )}
            >
              <span className="font-body text-[13px] text-txt-3">{s}</span>
              <span className="rounded-pill px-2.5 py-[3px] font-body text-[9px] font-medium uppercase tracking-[0.18em] text-txt-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.13)]">
                bald
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2.5 px-1 font-body text-[11px] leading-relaxed text-txt-3">
          Diese Bereiche kommen in einer der nächsten Versionen — noch gibt es hier nichts einzustellen.
        </p>
      </section>

      {/* astrologer entry — only outside the client view */}
      {!viewer && (
        <button
          onClick={() => { window.location.hash = "#/admin"; }}
          className="vela-card-soft mt-6 flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:shadow-[inset_0_0_0_1px_rgba(var(--rgb-iris),0.35)]"
        >
          <span className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-lilac" />
            <span className="font-body text-[13px] font-medium text-txt">Astrologin · zum Cockpit</span>
          </span>
          <ChevronRight className="h-4 w-4 text-txt-3" />
        </button>
      )}
    </ScreenShell>
  );
}
