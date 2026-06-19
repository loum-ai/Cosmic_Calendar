import { useState } from "react";
import { Plus } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { OrbImage } from "@/components/OrbImage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/useApp";
import { CHART, signName } from "@/lib/data";

const CATEGORIES = [
  { key: "partner", label: "Partner", color: "#ff8fb0", glyph: "♥" },
  { key: "familie", label: "Familie", color: "#f8c050", glyph: "☖" },
  { key: "freund", label: "Freund", color: "#2fde8c", glyph: "✶" },
  { key: "beruflich", label: "Beruflich", color: "#4fd6ef", glyph: "◇" },
] as const;

interface Person {
  name: string;
  date: string;
  cat: string;
}

export function SynastrieScreen() {
  const setComposerOpen = useApp((s) => s.setComposerOpen);
  const ask = useApp((s) => s.ask);
  const [people, setPeople] = useState<Person[]>([]);
  const [sel, setSel] = useState(0);
  const [adding, setAdding] = useState(true);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [cat, setCat] = useState<string>("partner");

  const canSave = name.trim() !== "" && date.trim() !== "";

  const save = () => {
    if (!canSave) return;
    setPeople((p) => [...p, { name: name.trim(), date, cat }]);
    setSel(people.length);
    setName("");
    setDate("");
    setAdding(false);
  };

  const current = people[sel];
  const catMeta = (c: string) => CATEGORIES.find((x) => x.key === c) ?? CATEGORIES[0];
  // deterministic placeholder resonance until real synastry math lands
  const resonance = current ? 58 + ((current.name.length * 7) % 38) : 0;

  return (
    <ScreenShell>
      <div>
        <div className="vela-label">Beziehungen</div>
        <h1 className="mt-1.5 font-display text-2xl font-bold leading-tight text-txt">Synastrie</h1>
        <p className="mt-1 font-mono text-[12px] text-txt-2">Wie ihr zusammenklingt</p>
      </div>

      {/* people switcher */}
      {people.length > 0 && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {people.map((p, i) => {
            const m = catMeta(p.cat);
            return (
              <button
                key={i}
                onClick={() => {
                  setSel(i);
                  setAdding(false);
                }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-pill border px-3.5 py-2 transition active:scale-95",
                  sel === i && !adding ? "bg-surface-2" : "bg-surface",
                )}
                style={{ borderColor: sel === i && !adding ? `${m.color}88` : "var(--border-subtle)" }}
              >
                <span className="vela-glyph text-sm" style={{ color: m.color }}>
                  {m.glyph}
                </span>
                <span className="font-body text-xs text-ink-soft/85">{p.name}</span>
              </button>
            );
          })}
          <button
            onClick={() => setAdding(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lilac/30 bg-surface text-lilac active:scale-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* add form */}
      {(adding || people.length === 0) && (
        <div className="mt-6 border-t border-line pt-2">
          <SectionHead title="Wen möchtest du vergleichen?" sub="Name & Geburtsdatum genügen" />
          <div className="flex flex-col gap-3.5">
            <label className="block">
              <span className="vela-label mb-1.5 block !text-[0.6rem]">Name</span>
              <Input placeholder="z. B. Jonas" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <span className="vela-label mb-1.5 block !text-[0.6rem]">Geburtsdatum</span>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="vela-label mb-1.5 block !text-[0.6rem]">Geburtszeit · optional</span>
              <Input type="time" />
            </label>
            <label className="block">
              <span className="vela-label mb-1.5 block !text-[0.6rem]">Geburtsort · optional</span>
              <Input placeholder="z. B. Berlin" />
            </label>
          </div>
          <div className="mt-4">
            <div className="vela-eyebrow mb-2 text-lilac/70">Beziehung</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCat(c.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-pill border px-3 py-1.5 font-body text-[11px] transition active:scale-95",
                  )}
                  style={{
                    borderColor: cat === c.key ? `${c.color}88` : "var(--border-subtle)",
                    background: cat === c.key ? `${c.color}1f` : "var(--bg-surface)",
                    color: cat === c.key ? c.color : "var(--text-secondary)",
                  }}
                >
                  <span className="vela-glyph">{c.glyph}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <Button variant="cta" className="mt-5 w-full" disabled={!canSave} onClick={save}>
            Verbindung berechnen
          </Button>
        </div>
      )}

      {/* results */}
      {current && !adding && (
        <section className="mt-7">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="relative flex items-center justify-center">
              <OrbImage size={64} float={false} className="-mr-4" />
              <OrbImage size={64} float={false} className="-ml-4" />
            </div>
            <div className="mt-5 font-mono text-[11px] text-mint">RESONANZ</div>
            <div className="font-display text-6xl font-extrabold vela-iris-text">{resonance}%</div>
            <p className="mt-2 font-mono text-[11px] text-txt-2">
              Du &amp; {current.name} · {catMeta(current.cat).label} · Beispiel
            </p>
          </div>

          <SectionHead title="Wie ihr verbunden seid" sub="Die stärksten Berührungspunkte" />
          <div>
            {[
              { glyph: "☉", title: "Eure Kerne", text: `Deine ${signName(CHART[0].lon)}-Sonne trifft auf ${current.name} — ihr zieht euch gerade dort an, wo ihr verschieden seid.` },
              { glyph: "♀", title: "Nähe & Zuneigung", text: "Ihr findet schnell einen gemeinsamen Geschmack. Zärtlichkeit und kleine Gesten fallen euch leicht." },
              { glyph: "☿", title: "Wie ihr redet", text: "Im Gespräch trefft ihr euch rasch — etwas Reibung hält es lebendig statt langweilig." },
            ].map((t) => (
              <div key={t.title} className="flex items-start gap-3.5 border-b border-line-soft py-3.5">
                <span className="vela-glyph mt-0.5 text-xl text-lilac">{t.glyph}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-semibold text-txt">{t.title}</div>
                  <p className="mt-1 font-body text-xs leading-relaxed text-txt-2">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="glass"
            className="mt-6 w-full"
            onClick={() => {
              setComposerOpen(true);
              void ask(`Wie passe ich mit ${current.name} zusammen?`);
            }}
          >
            Tiefere Deutung anfragen
          </Button>
        </section>
      )}
    </ScreenShell>
  );
}
