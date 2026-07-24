import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ScreenShell, SectionHead, PageHead } from "@/components/ScreenShell";
import { OrbImage } from "@/components/OrbImage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/useApp";
import { CHART, type Planet } from "@/lib/data";
import { computeChart } from "@/lib/compute";
import { synastry } from "@/lib/synastry";
import { searchPlace, type Place } from "@/lib/geocode";

const CATEGORIES = [
  { key: "partner", label: "Partner", color: "#ff8fb0", glyph: "♥" },
  { key: "familie", label: "Familie", color: "#f8c050", glyph: "☖" },
  { key: "freund", label: "Freund", color: "#20F0D0", glyph: "✶" },
  { key: "beruflich", label: "Beruflich", color: "#7896FF", glyph: "◇" },
] as const;

interface Person { name: string; cat: string; planets: Planet[] }

/* ── loum-Karten-Chemie ────────────────────────────────────────────────
   Eine Karte ist eine SOLIDE dunkle Ink-Fläche. Die einzige Kante ist die
   1px-Inset-Hairline — kein äußerer Drop-Shadow, kein backdrop-blur.
   Tiefe entsteht von INNEN (radiale Glows).                              */
const INK = "linear-gradient(180deg,#16161F 0%,#12121D 100%)";
const INK_HERO = "linear-gradient(180deg,#201D2C 0%,#1B1926 55%,#17141F 100%)";
const TILE =
  "relative overflow-hidden rounded-[18px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]";

/* Eyebrow: uppercase, weit gesperrt, klein, gedämpft — nie Akzentfarbe. */
const EYEBROW = "font-body text-[10.5px] font-medium uppercase tracking-[0.18em] text-txt-3";
/* Karten-Titel: Cinzel Regular, FLACH, VERSALIEN — nie kursiv, nie bold. */
const CARD_TITLE = "font-cinzel text-[14.5px] font-normal uppercase leading-tight tracking-[0.01em] text-txt";

const inputCls =
  "w-full rounded-xl border border-line bg-[#12121D] px-3.5 py-2.5 font-body text-sm text-txt outline-none transition-colors focus:border-lilac";

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
                    : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                }}>
                <span className="vela-glyph text-sm" style={{ color: m.color }}>{m.glyph}</span>
                <span className={cn("font-body text-xs", active ? "text-txt" : "text-txt-2")}>{p.name}</span>
              </button>
            );
          })}
          <button onClick={() => setAdding(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lilac transition active:scale-90"
            style={{ background: INK, boxShadow: "inset 0 0 0 1px rgba(120,150,255,0.34)" }}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* add form */}
      {(adding || people.length === 0) && (
        <div className="mt-6 border-t border-line pt-2">
          <SectionHead title="Wen möchtest du vergleichen?" sub="Für ein echtes Vergleichsbild brauchen wir Datum, Uhrzeit und (für die Achsen) den Ort." />
          <div className="flex flex-col gap-3.5">
            <label className="block">
              <span className={cn(EYEBROW, "mb-1.5 block")}>Name</span>
              <input className={inputCls} placeholder="z. B. Jonas" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <div className="flex gap-2.5">
              <label className="block flex-1">
                <span className={cn(EYEBROW, "mb-1.5 block")}>Geburtsdatum</span>
                <input className={cn(inputCls, "w-full")} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="block w-[130px]">
                <span className={cn(EYEBROW, "mb-1.5 block")}>Uhrzeit</span>
                <input className={cn(inputCls, "w-full")} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
            </div>
            {!time && <p className="-mt-1.5 font-body text-[11.5px] leading-relaxed text-txt-3">Uhrzeit unbekannt? Lass es leer — wir rechnen mit 12:00 (Mond &amp; Häuser dann ungefähr).</p>}
            <label className="relative block">
              <span className={cn(EYEBROW, "mb-1.5 block")}>Geburtsort <span className="normal-case tracking-normal text-txt-3">· optional</span></span>
              <input className={inputCls} placeholder="z. B. Berlin — dann aus der Liste wählen" value={placeQ} onChange={(e) => { setPlaceQ(e.target.value); setPlace(null); }} />
              {places.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl"
                  style={{ background: INK, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10), 0 18px 40px -20px rgba(0,0,4,0.85)" }}>
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
              {CATEGORIES.map((c) => (
                <button key={c.key} onClick={() => setCat(c.key)}
                  className="flex items-center gap-1.5 rounded-pill px-3.5 py-2 font-body text-[11.5px] transition active:scale-95"
                  style={{
                    background: INK,
                    boxShadow: cat === c.key ? `inset 0 0 0 1px ${c.color}70` : "inset 0 0 0 1px rgba(255,255,255,0.08)",
                    color: cat === c.key ? c.color : "var(--text-secondary)",
                  }}>
                  <span className="vela-glyph">{c.glyph}</span>{c.label}
                </button>
              ))}
            </div>
          </div>
          {err && <p className="mt-3 font-body text-[12px] text-aspect-opp">{err}</p>}
          <Button variant="cta" className="mt-5 w-full" disabled={!canSave} onClick={save}>Verbindung berechnen</Button>
        </div>
      )}

      {/* results */}
      {current && syn && !adding && (
        <section className="mt-7">
          {/* Resonanz — der eine Display-Moment des Screens: solide Hero-Ink,
              Tiefe von innen, Zahl in Cinzel mit dem „lit word"-Halo. */}
          <div className="relative overflow-hidden rounded-[24px] px-5 py-8 text-center"
            style={{ background: INK_HERO, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.09), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
            <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/3 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(120,150,255,0.20) 0%, rgba(120,150,255,0.06) 46%, transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center justify-center">
                <OrbImage size={64} float={false} className="-mr-4" />
                <OrbImage size={64} float={false} className="-ml-4" />
              </div>
              <div className={cn(EYEBROW, "mt-5")}>Resonanz</div>
              <div className="mt-1 font-cinzel text-[58px] font-normal leading-none tracking-[-0.01em] vela-iris-text">{syn.resonance}%</div>

              {/* die Zahl ist belegt — hier steht, woraus sie stammt */}
              <p className="mx-auto mt-4 max-w-[38ch] font-body text-[12.5px] leading-relaxed text-txt-2">
                Anteil harmonischer Verbindungen aus <b className="font-semibold text-txt">{syn.total}</b> Aspekten zwischen euren persönlichen Planeten.
              </p>
              <div className="mt-3.5 flex items-center justify-center gap-2">
                <span className="rounded-pill px-3 py-1 font-body text-[11.5px] text-mint" style={{ boxShadow: "inset 0 0 0 1px rgba(32,240,208,0.30)" }}>{syn.harmonious} harmonisch</span>
                <span className="rounded-pill px-3 py-1 font-body text-[11.5px] text-aspect-opp" style={{ boxShadow: "inset 0 0 0 1px rgba(255,143,176,0.30)" }}>{syn.challenging} fordernd</span>
              </div>

              <div className="mx-auto mt-5 h-px w-16 bg-line" />
              <p className={cn(EYEBROW, "mt-4")}>Du &amp; {current.name} · {catMeta(current.cat).label}</p>
            </div>
          </div>

          {syn.touchpoints.length > 0 ? (
            <>
              <SectionHead title="Wie ihr verbunden seid" sub="Die stärksten Berührungspunkte — berechnet aus euren Charts" />
              <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                {syn.touchpoints.map((t) => {
                  const m = catMeta(current.cat);
                  /* Der Satz kommt als eine Zeile: „Fakt — Deutung". Erste
                     Hälfte ist die Lede, der Rest wird ruhiger gesetzt. */
                  const [lede, ...rest] = t.text.split(" — ");
                  return (
                    <article key={t.title} className={cn(TILE, "flex items-start gap-4 p-4")} style={{ background: INK }}>
                      <span aria-hidden className="pointer-events-none absolute -left-12 -top-14 h-40 w-40 rounded-full"
                        style={{ background: "radial-gradient(circle, rgba(120,150,255,0.14) 0%, transparent 70%)" }} />
                      {/* Glyphen-Paar als Badge: das Thema (links) trifft auf
                          die Beziehungsart (rechts) — zwei Charts, ein Kontakt. */}
                      <span aria-hidden className="relative mt-0.5 flex shrink-0 items-center">
                        <span className="vela-glyph flex h-9 w-9 items-center justify-center rounded-full text-[15px] text-lilac"
                          style={{ background: "#191826", boxShadow: "inset 0 0 0 1px rgba(120,150,255,0.38)" }}>{t.glyph}</span>
                        <span className="vela-glyph -ml-2.5 flex h-9 w-9 items-center justify-center rounded-full text-[14px]"
                          style={{ background: "#14131E", boxShadow: `inset 0 0 0 1px ${m.color}55`, color: m.color }}>{m.glyph}</span>
                      </span>
                      <div className="relative min-w-0 flex-1">
                        <h3 className={CARD_TITLE}>{t.title}</h3>
                        <p className="mt-2 font-body text-[13px] leading-relaxed text-txt">{lede}</p>
                        {rest.length > 0 && (
                          <p className="mt-1.5 font-body text-[12.5px] leading-relaxed text-txt-2 first-letter:uppercase">{rest.join(" — ")}</p>
                        )}
                      </div>
                    </article>
                  );
                })}
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
