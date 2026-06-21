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
  { key: "freund", label: "Freund", color: "#2fde8c", glyph: "✶" },
  { key: "beruflich", label: "Beruflich", color: "#4fd6ef", glyph: "◇" },
] as const;

interface Person { name: string; cat: string; planets: Planet[] }

const inputCls = "w-full rounded-xl border border-line bg-[#0c0c14] px-3.5 py-2.5 font-body text-sm text-txt outline-none focus:border-lilac";

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
            return (
              <button key={i} onClick={() => { setSel(i); setAdding(false); }}
                className={cn("flex shrink-0 items-center gap-2 rounded-pill border px-3.5 py-2 transition active:scale-95", sel === i && !adding ? "bg-surface-2" : "bg-surface")}
                style={{ borderColor: sel === i && !adding ? `${m.color}88` : "var(--border-subtle)" }}>
                <span className="vela-glyph text-sm" style={{ color: m.color }}>{m.glyph}</span>
                <span className="font-body text-xs text-ink-soft/85">{p.name}</span>
              </button>
            );
          })}
          <button onClick={() => setAdding(true)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lilac/30 bg-surface text-lilac active:scale-90">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* add form */}
      {(adding || people.length === 0) && (
        <div className="mt-6 border-t border-line pt-2">
          <SectionHead title="Wen möchtest du vergleichen?" sub="Für ein echtes Vergleichsbild brauchen wir Datum, Uhrzeit und (für die Achsen) den Ort." />
          <div className="flex flex-col gap-3">
            <input className={inputCls} placeholder="Name (z. B. Jonas)" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex gap-2.5">
              <input className={cn(inputCls, "flex-1")} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <input className={cn(inputCls, "w-[120px]")} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            {!time && <p className="-mt-1 font-body text-[11px] text-txt-3">Uhrzeit unbekannt? Lass es leer — wir rechnen mit 12:00 (Mond &amp; Häuser dann ungefähr).</p>}
            <div className="relative">
              <input className={inputCls} placeholder="Geburtsort (optional)" value={placeQ} onChange={(e) => { setPlaceQ(e.target.value); setPlace(null); }} />
              {places.length > 0 && (
                <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-[#12121c] shadow-xl">
                  {places.map((p, i) => (
                    <button key={i} onClick={() => { setPlace(p); setPlaceQ(p.label); setPlaces([]); }} className="block w-full px-3.5 py-2.5 text-left font-body text-[13px] text-txt-2 hover:bg-white/5">{p.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="vela-eyebrow mb-2 text-lilac/70">Beziehung</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.key} onClick={() => setCat(c.key)}
                  className="flex items-center gap-1.5 rounded-pill border px-3 py-1.5 font-body text-[11px] transition active:scale-95"
                  style={{ borderColor: cat === c.key ? `${c.color}88` : "var(--border-subtle)", background: cat === c.key ? `${c.color}1f` : "var(--bg-surface)", color: cat === c.key ? c.color : "var(--text-secondary)" }}>
                  <span className="vela-glyph">{c.glyph}</span>{c.label}
                </button>
              ))}
            </div>
          </div>
          {err && <p className="mt-3 font-body text-[12px] text-rose-300">{err}</p>}
          <Button variant="cta" className="mt-5 w-full" disabled={!canSave} onClick={save}>Verbindung berechnen</Button>
        </div>
      )}

      {/* results */}
      {current && syn && !adding && (
        <section className="mt-7">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="relative flex items-center justify-center">
              <OrbImage size={64} float={false} className="-mr-4" />
              <OrbImage size={64} float={false} className="-ml-4" />
            </div>
            <div className="mt-5 font-mono text-[11px] text-mint">RESONANZ</div>
            <div className="font-display text-6xl font-extrabold vela-iris-text">{syn.resonance}%</div>
            {/* the number is sourced — show exactly what it's from */}
            <p className="mt-2 max-w-[40ch] font-body text-[12px] leading-relaxed text-txt-2">
              Anteil harmonischer Verbindungen aus <b>{syn.total}</b> Aspekten zwischen euren persönlichen Planeten
              {" "}— <span className="text-mint">{syn.harmonious} harmonisch</span>, <span className="text-[#ff8fb0]">{syn.challenging} fordernd</span>.
            </p>
            <p className="mt-1 font-mono text-[10px] text-txt-3">Du &amp; {current.name} · {catMeta(current.cat).label}</p>
          </div>

          {syn.touchpoints.length > 0 ? (
            <>
              <SectionHead title="Wie ihr verbunden seid" sub="Die stärksten Berührungspunkte — berechnet aus euren Charts" />
              <div>
                {syn.touchpoints.map((t) => (
                  <div key={t.title} className="flex items-start gap-3.5 border-b border-line-soft py-3.5">
                    <span className="vela-glyph mt-0.5 text-xl text-lilac">{t.glyph}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm font-semibold text-txt">{t.title}</div>
                      <p className="mt-1 font-body text-xs leading-relaxed text-txt-2">{t.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="font-body text-[13px] text-txt-2">Zwischen euren persönlichen Planeten gibt es keine engen Aspekte — eine eher unabhängige, reibungsarme Verbindung.</p>
          )}

          <Button variant="glass" className="mt-6 w-full" onClick={() => { setComposerOpen(true); void ask(`Wie passe ich mit ${current.name} zusammen?`); }}>
            Tiefere Deutung anfragen
          </Button>
        </section>
      )}
    </ScreenShell>
  );
}
