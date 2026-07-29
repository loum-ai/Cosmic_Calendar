import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ScreenShell, SectionHead, PageHead } from "@/components/ScreenShell";
import { OrbImage } from "@/components/OrbImage";
import { ChartWheel } from "@/components/ChartWheel";
import { Reveal } from "@/components/Reveal";
import { useReading } from "@/lib/genReadings";
import { PLANET_PHOTO, PLANET_GLOW, PLANET_SCALE } from "@/lib/planetPhotos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/useApp";
import { CHART, type Planet } from "@/lib/data";
import { computeChart } from "@/lib/compute";
import { synastry, type Touchpoint } from "@/lib/synastry";
import { shortHash } from "@/lib/factsContext";
import { searchPlace, type Place } from "@/lib/geocode";

const CATEGORIES = [
  { key: "partner", label: "Partner", color: "#ff8fb0", glyph: "♥" },
  { key: "familie", label: "Familie", color: "#f8c050", glyph: "☖" },
  { key: "freund", label: "Freund", color: "#20F0D0", glyph: "✶" },
  { key: "beruflich", label: "Beruflich", color: "#5599FF", glyph: "◇" },
] as const;

interface Person { name: string; cat: string; planets: Planet[] }

/* ── loum-Karten-Chemie ────────────────────────────────────────────────
   Eine Karte ist eine SOLIDE dunkle Ink-Fläche. Die einzige Kante ist die
   1px-Inset-Hairline — kein äußerer Drop-Shadow, kein backdrop-blur.
   Tiefe entsteht von INNEN (radiale Glows).                              */
const INK = "linear-gradient(180deg,#16161F 0%,#12121D 100%)";
const INK_HERO = "linear-gradient(180deg,#201D2C 0%,#1B1926 55%,#17141F 100%)";
const TILE =
  "relative overflow-hidden rounded-[16px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.13)]";

/* Eyebrow: uppercase, weit gesperrt, klein, gedämpft — nie Akzentfarbe. */
const EYEBROW = "font-body text-[11px] font-medium uppercase tracking-[0.18em] text-txt-3";
/* Karten-Titel: Cinzel Regular, FLACH, VERSALIEN — nie kursiv, nie bold. */
const CARD_TITLE = "font-cinzel text-[15px] font-normal uppercase leading-tight tracking-[0.01em] text-txt";

const inputCls =
  "w-full rounded-xl border border-line bg-[#12121D] px-3.5 py-2.5 font-body text-sm text-txt outline-none transition-colors focus:border-lilac";

/**
 * Der Kopf des Screens ist die These: DEIN Geburtsbild trifft auf ein zweites.
 * Links das echte Rad (keine Attrappe), rechts der noch leere Ring in der
 * Farbe der gewählten Beziehungsart — er füllt sich, sobald das Gegenüber
 * gerechnet ist. So sieht man vor dem ersten Tippen, worum es hier geht.
 */
function ZweiBilder({ accent, glyph, partner }: { accent: string; glyph: string; partner?: Person | null }) {
  return (
    <div className="relative mt-5 flex items-center justify-center py-2">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, rgba(var(--rgb-iris),0.16) 0%, ${accent}14 42%, transparent 70%)`, mixBlendMode: "screen" }}
      />
      <div className="relative w-[124px] shrink-0 opacity-90">
        <ChartWheel />
      </div>
      <div
        className="relative -ml-7 flex h-[124px] w-[124px] shrink-0 items-center justify-center rounded-full"
        style={{
          background: INK,
          boxShadow: `inset 0 0 0 1px ${accent}${partner ? "66" : "33"}`,
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-full"
          style={{ boxShadow: `inset 0 0 0 1px ${accent}22` }}
        />
        <span className="vela-glyph text-[30px]" style={{ color: accent, filter: `drop-shadow(0 0 14px ${accent}66)` }}>
          {glyph}
        </span>
      </div>
    </div>
  );
}


/**
 * Ein Berührungspunkt. Die Beobachtung („Deine Mars Trigon Darius' Sonne")
 * ist gerechnet; die DEUTUNG darunter kommt aus dem Deutungs-Dienst und ist
 * für genau diese zwei Charts und diese Beziehungsart erzeugt. Vorher stand
 * hier eine von drei Schablonen („Fließt leicht zusammen — ein müheloses
 * Verstehen"), die jedes Paar mit demselben Aspekt wortgleich las.
 *
 * Cache-Schlüssel: der Deutungs-Dienst stellt das Chart des Nutzers voran,
 * hier kommt der Fingerabdruck des Gegenübers dazu — jedes Paar bekommt also
 * seine eigene Deutung, und ein zweiter Aufruf ist sofort da.
 */
function TouchpointCard({ t, m, partner }: { t: Touchpoint; m: { label: string; color: string; glyph: string }; partner: Person }) {
  const hash = useMemo(
    () => shortHash(partner.planets.map((p) => `${p.key}${Math.round(p.lon * 10)}`).join("")),
    [partner],
  );
  const { text, loading } = useReading(
    `syn:${hash}:${partner.cat}:${t.key}:v1`,
    `Synastrie — zwei Geburtsbilder im Vergleich. Das Chart in den FAKTEN gehört der Person, die liest; das Gegenüber heißt ${partner.name}. Die beiden sind: ${m.label}.

Der Kontakt, um den es hier geht: ${t.fakt}. ${t.harmon > 0 ? "Ein fließender Aspekt." : t.harmon < 0 ? "Ein spannungsreicher Aspekt." : "Eine Konjunktion — die beiden Kräfte verschmelzen."} Überschrift der Karte: „${t.title}".

Deute DIESEN einen Kontakt für die Beziehung der beiden — 3–4 kurze Sätze, Du-Form, an die lesende Person gerichtet. Sag, wie sich das zwischen ihnen im Alltag zeigt und woran sie es wiedererkennt. Benenne beides: was daran trägt und was es kosten kann. Beziehe den Beziehungstyp (${m.label}) mit ein — dieselbe Verbindung bedeutet zwischen Partnern etwas anderes als zwischen Kolleginnen. Kein Satz, der auf jedes Paar passen würde. Keine Fachbegriffe ohne sofortige Übersetzung, kein Pathos.`,
  );
  const photo = PLANET_PHOTO[t.key];
  return (
    <article className={cn(TILE, "flex items-start gap-4 p-4")} style={{ background: INK, isolation: "isolate" }}>
      {/* Der Planet, der dieses Thema trägt — angeschnitten in der Ecke, aber
          INNERHALB der Kartenfläche. Mit negativem Versatz lief das Foto auf
          iOS über die Kante hinaus: overflow-hidden klippt dort nicht
          zuverlässig, wenn das Kind mix-blend-mode trägt. */}
      {photo ? (
        <span aria-hidden className="pointer-events-none absolute right-0 top-0 h-28 w-28 overflow-hidden">
          <span className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, rgba(${PLANET_GLOW[t.key] ?? "120,150,255"},0.26) 0%, transparent 68%)`, mixBlendMode: "screen" }} />
          <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover"
            style={{ mixBlendMode: "screen", opacity: 0.34, transform: `scale(${1 + (PLANET_SCALE[t.key] ?? 0.6) * 0.2})` }} />
        </span>
      ) : (
        <span aria-hidden className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(var(--rgb-iris),0.14) 0%, transparent 70%)" }} />
      )}
      {/* Glyphen-Paar: das Thema (links) trifft auf die Beziehungsart (rechts). */}
      <span aria-hidden className="relative mt-0.5 flex shrink-0 items-center">
        <span className="vela-glyph flex h-9 w-9 items-center justify-center rounded-full text-[15px] text-lilac"
          style={{ background: "#191826", boxShadow: "inset 0 0 0 1px rgba(var(--rgb-iris),0.38)" }}>{t.glyph}</span>
        <span className="vela-glyph -ml-2.5 flex h-9 w-9 items-center justify-center rounded-full text-[15px]"
          style={{ background: "#14131E", boxShadow: `inset 0 0 0 1px ${m.color}55`, color: m.color }}>{m.glyph}</span>
      </span>
      {/* rechts Luft lassen, solange dort das Planetenfoto liegt */}
      <div className={cn("relative min-w-0 flex-1", photo && "pr-16")}>
        <h3 className={CARD_TITLE}>{t.title}</h3>
        <p className="mt-1.5 font-body text-[11px] uppercase tracking-[0.14em] text-txt-3">{t.fakt}</p>
        {text ? (
          <p className="mt-2.5 font-body text-[13px] leading-[1.62] text-txt">{text}</p>
        ) : loading ? (
          <div className="mt-3 space-y-2">
            {[96, 88, 70].map((w, i) => (
              <div key={i} className="h-2.5 animate-pulse rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : (
          <p className="mt-2.5 font-body text-[13px] leading-[1.62] text-txt-2 first-letter:uppercase">{t.text.split(" — ").slice(1).join(" — ")}</p>
        )}
      </div>
    </article>
  );
}

export function SynastrieScreen() {
  const setComposerOpen = useApp((s) => s.setComposerOpen);
  const ask = useApp((s) => s.ask);
  const [people, setPeople] = useState<Person[]>([]);
  const [sel, setSel] = useState(0);
  const [adding, setAdding] = useState(true);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cat, setCat] = useState<string>("partner");
  const [placeQ, setPlaceQ] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!placeQ.trim() || place?.label === placeQ) { setPlaces([]); return; }
    const t = setTimeout(async () => setPlaces(await searchPlace(placeQ)), 300);
    return () => clearTimeout(t);
  }, [placeQ, place]);

  const canSave = name.trim() !== "" && date !== "";

  const save = () => {
    if (!canSave) return;
    setErr(null);
    try {
      const c = computeChart({ date, time: time || "12:00", lat: place?.lat ?? 51.5, lon: place?.lon ?? 0 });
      setPeople((p) => [...p, { name: name.trim(), cat, planets: c.planets }]);
      setSel(people.length);
      setName(""); setDate(""); setTime(""); setPlaceQ(""); setPlace(null);
      setAdding(false);
    } catch {
      setErr("Diese Geburtsdaten konnten nicht berechnet werden — bitte prüfen.");
    }
  };

  const current = people[sel];
  const catMeta = (c: string) => CATEGORIES.find((x) => x.key === c) ?? CATEGORIES[0];
  const syn = useMemo(() => (current ? synastry(CHART, current.planets, current.name) : null), [current]);

  return (
    <ScreenShell>
      <PageHead label="Beziehungen" title="Synastrie" sub="Wie zwei Geburtsbilder zusammenklingen" />

      {/* people switcher */}
      {people.length > 0 && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {people.map((p, i) => {
            const m = catMeta(p.cat);
            const active = sel === i && !adding;
            return (
              <button key={i} onClick={() => { setSel(i); setAdding(false); }}
                className="flex shrink-0 items-center gap-2 rounded-pill px-3.5 py-2 transition active:scale-95"
                style={{
                  background: INK,
                  boxShadow: active
                    ? `inset 0 0 0 1px ${m.color}70`
                    : "inset 0 0 0 1px rgba(255,255,255,0.13)",
                }}>
                <span className="vela-glyph text-sm" style={{ color: m.color }}>{m.glyph}</span>
                <span className={cn("font-body text-xs", active ? "text-txt" : "text-txt-2")}>{p.name}</span>
              </button>
            );
          })}
          <button onClick={() => setAdding(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lilac transition active:scale-90"
            style={{ background: INK, boxShadow: "inset 0 0 0 1px rgba(var(--rgb-iris),0.34)" }}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* add form */}
      {(adding || people.length === 0) && (
        <div className="mt-6 border-t border-line pt-2">
          <Reveal>
            <ZweiBilder accent={catMeta(cat).color} glyph={catMeta(cat).glyph} />
          </Reveal>
          <Reveal i={1}>
          <SectionHead title="Wen möchtest du vergleichen?" sub="Für ein echtes Vergleichsbild brauchen wir Datum, Uhrzeit und (für die Achsen) den Ort." />
          </Reveal>
          <div className="flex flex-col gap-3.5">
            <label className="block">
              <span className={cn(EYEBROW, "mb-1.5 block")}>Name</span>
              <input className={inputCls} placeholder="z. B. Jonas" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            {/* Auf dem Telefon stehen Datum und Uhrzeit UNTEREINANDER, erst ab
                Tablet nebeneinander. Grund: iOS gibt date/time-Feldern eine
                große Eigenbreite. In der alten Flex-Zeile (flex-1 + feste
                130px) konnte das Kind wegen `min-width:auto` nicht schrumpfen —
                die Uhrzeit wurde aus dem Bild geschoben und wirkte leer, weil
                ihr Wertebereich abgeschnitten war. Volle Breite kann per
                Konstruktion nicht überlaufen. */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-2.5">
              <label className="block min-w-0">
                <span className={cn(EYEBROW, "mb-1.5 block")}>Geburtsdatum</span>
                <input className={cn(inputCls, "w-full min-w-0")} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="block min-w-0">
                <span className={cn(EYEBROW, "mb-1.5 block")}>Uhrzeit</span>
                <input className={cn(inputCls, "w-full min-w-0")} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
            </div>
            {!time && <p className="-mt-1.5 font-body text-[11px] leading-relaxed text-txt-3">Uhrzeit unbekannt? Lass es leer — wir rechnen mit 12:00 (Mond &amp; Häuser dann ungefähr).</p>}
            <label className="relative block">
              <span className={cn(EYEBROW, "mb-1.5 block")}>Geburtsort <span className="normal-case tracking-normal text-txt-3">· optional</span></span>
              <input className={inputCls} placeholder="z. B. Berlin — dann aus der Liste wählen" value={placeQ} onChange={(e) => { setPlaceQ(e.target.value); setPlace(null); }} />
              {places.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl"
                  style={{ background: INK, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.13), 0 18px 40px -20px rgba(0,0,4,0.85)" }}>
                  {places.map((p, i) => (
                    <button key={i} onClick={() => { setPlace(p); setPlaceQ(p.label); setPlaces([]); }} className="block w-full px-3.5 py-2.5 text-left font-body text-[13px] text-txt-2 transition-colors hover:bg-surface hover:text-txt">{p.label}</button>
                  ))}
                </div>
              )}
            </label>
          </div>
          <div className="mt-5">
            <div className={cn(EYEBROW, "mb-2.5")}>Beziehung</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const on = cat === c.key;
                return (
                  <button key={c.key} onClick={() => setCat(c.key)} aria-pressed={on}
                    className="flex items-center gap-1.5 rounded-pill px-3.5 py-2 font-body text-[11px] transition active:scale-95"
                    style={{
                      // Karten-Chemie auch im Kleinen: die Auswahl leuchtet von
                      // INNEN in ihrer Farbe, statt nur eine Kante zu färben.
                      background: on
                        ? `radial-gradient(120% 140% at 50% -30%, ${c.color}24 0%, transparent 62%), ${INK}`
                        : INK,
                      boxShadow: on ? `inset 0 0 0 1px ${c.color}70` : "inset 0 0 0 1px rgba(255,255,255,0.13)",
                      color: on ? c.color : "var(--text-secondary)",
                    }}>
                    <span className="vela-glyph">{c.glyph}</span>{c.label}
                  </button>
                );
              })}
            </div>
          </div>
          {err && <p className="mt-3 font-body text-[13px] text-aspect-opp">{err}</p>}
          <Button variant="cta" className="mt-5 w-full" disabled={!canSave} onClick={save}>Verbindung berechnen</Button>
        </div>
      )}

      {/* results */}
      {current && syn && !adding && (
        <section className="mt-7">
          {/* Resonanz — der eine Display-Moment des Screens: solide Hero-Ink,
              Tiefe von innen, Zahl in Cinzel mit dem „lit word"-Halo. */}
          <div className="relative overflow-hidden rounded-[20px] px-5 py-8 text-center"
            style={{ background: INK_HERO, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.13), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/3 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(var(--rgb-iris),0.20) 0%, rgba(var(--rgb-iris),0.06) 46%, transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center justify-center">
                <OrbImage size={64} float={false} className="-mr-4" />
                <OrbImage size={64} float={false} className="-ml-4" />
              </div>
              <div className={cn(EYEBROW, "mt-5")}>Resonanz</div>
              <div className="mt-1 font-cinzel text-[58px] font-normal leading-none tracking-[-0.01em] vela-iris-text">{syn.resonance}%</div>

              {/* die Zahl ist belegt — hier steht, woraus sie stammt */}
              <p className="mx-auto mt-4 max-w-[38ch] font-body text-[13px] leading-relaxed text-txt-2">
                Anteil harmonischer Verbindungen aus <b className="font-semibold text-txt">{syn.total}</b> Aspekten zwischen euren persönlichen Planeten.
              </p>
              <div className="mt-3.5 flex items-center justify-center gap-2">
                <span className="rounded-pill px-3 py-1 font-body text-[11px] text-mint" style={{ boxShadow: "inset 0 0 0 1px rgba(32,240,208,0.30)" }}>{syn.harmonious} harmonisch</span>
                <span className="rounded-pill px-3 py-1 font-body text-[11px] text-aspect-opp" style={{ boxShadow: "inset 0 0 0 1px rgba(255,143,176,0.30)" }}>{syn.challenging} fordernd</span>
              </div>

              <div className="mx-auto mt-5 h-px w-16 bg-line" />
              <p className={cn(EYEBROW, "mt-4")}>Du &amp; {current.name} · {catMeta(current.cat).label}</p>
            </div>
          </div>

          {syn.touchpoints.length > 0 ? (
            <>
              <SectionHead title="Wie ihr verbunden seid" sub="Die stärksten Berührungspunkte — berechnet aus euren Charts" />
              <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                {syn.touchpoints.map((t) => (
                  <TouchpointCard key={t.title} t={t} m={catMeta(current.cat)} partner={current} />
                ))}
              </div>
            </>
          ) : (
            <div className={cn(TILE, "mt-6 p-5")} style={{ background: INK }}>
              <p className="font-body text-[13px] leading-relaxed text-txt-2">Zwischen euren persönlichen Planeten gibt es keine engen Aspekte — eine eher unabhängige, reibungsarme Verbindung.</p>
            </div>
          )}

          <Button variant="glass" className="mt-6 w-full" onClick={() => { setComposerOpen(true); void ask(`Wie passe ich mit ${current.name} zusammen?`); }}>
            Tiefere Deutung anfragen
          </Button>
        </section>
      )}
    </ScreenShell>
  );
}
