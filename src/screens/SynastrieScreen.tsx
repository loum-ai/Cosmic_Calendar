import { useState } from "react";
import { Plus } from "lucide-react";
import { ScreenShell, SectionHead } from "@/components/ScreenShell";
import { GlassPanel } from "@/components/GlassPanel";
import { IridescentOrb } from "@/components/IridescentOrb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
        <h1 className="vela-display !text-4xl">Synastrie</h1>
        <p className="vela-sub mt-1.5">Wie ihr zusammenklingt</p>
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
                  sel === i && !adding ? "bg-white/[0.1]" : "bg-white/[0.04]",
                )}
                style={{ borderColor: sel === i && !adding ? `${m.color}88` : "rgba(255,255,255,0.1)" }}
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-lilac/30 bg-white/[0.06] text-lilac active:scale-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* add form */}
      {(adding || people.length === 0) && (
        <GlassPanel className="mt-5 p-5">
          <SectionHead title="Wen möchtest du vergleichen?" sub="Name & Geburtsdatum genügen" />
          <div className="flex flex-col gap-3">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input placeholder="Geburtszeit (optional)" />
            <Input placeholder="Geburtsort (optional)" />
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
                    borderColor: cat === c.key ? `${c.color}88` : "rgba(255,255,255,0.1)",
                    background: cat === c.key ? `${c.color}1f` : "rgba(255,255,255,0.04)",
                    color: cat === c.key ? c.color : "rgba(220,213,244,0.62)",
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
        </GlassPanel>
      )}

      {/* results */}
      {current && !adding && (
        <section className="mt-7">
          <GlassPanel className="flex flex-col items-center p-6 text-center" nebula>
            <div className="relative flex items-center justify-center">
              <IridescentOrb size={70} float={false} className="-mr-4" />
              <IridescentOrb size={70} float={false} className="-ml-4" />
            </div>
            <div className="mt-4 vela-eyebrow text-mint-soft">Resonanz</div>
            <div className="font-display text-5xl font-extrabold vela-iris-text">{resonance}%</div>
            <p className="mt-2 font-body text-xs font-light text-ink/65">
              Du & {current.name} · {catMeta(current.cat).label}
            </p>
          </GlassPanel>

          <SectionHead title="Wie ihr verbunden seid" sub="Die stärksten Berührungspunkte" />
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-card border border-white/[0.06] bg-white/[0.035]" />
            ))}
          </div>
          <Button variant="glass" className="mt-4 w-full">
            Tiefere Deutung anfragen
          </Button>
        </section>
      )}
    </ScreenShell>
  );
}
