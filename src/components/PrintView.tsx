import { Printer, X } from "lucide-react";
import { ChartWheel } from "./ChartWheel";
import { useApp } from "@/store/useApp";
import { CHART, NODES, ASC, MC, CUSPS, PROFILE, SN, HOUSE, ASPDEF, PINFO, signName, computeAspects } from "@/lib/data";
import { getVerification, aiSummary, aiSign, aiHouse } from "@/lib/interpret";
import { computeTransits, skySummary } from "@/lib/transits";

const ELEM = ["Feuer", "Erde", "Luft", "Wasser"] as const;
const MODE = ["kardinal", "fix", "veränderlich"] as const;
const PCOL: Record<string, string> = {
  sun: "#b8860b", moon: "#5a6fa0", mercury: "#2f7d99", venus: "#0a8f73", mars: "#c0392b",
  jupiter: "#b8860b", saturn: "#7c5bbf", uranus: "#1c8f7e", neptune: "#3a5bbf", pluto: "#8e44ad",
  chiron: "#2f7d99", lilith: "#a83b7a", node_n: "#3a5bbf", node_s: "#3a5bbf", asc: "#6b4fb0",
};
const col = (k: string) => PCOL[k] ?? "#4a3a7a";

function dms(lon: number) {
  const d = (((lon % 360) + 360) % 360) % 30;
  const deg = Math.floor(d);
  const min = Math.floor((d - deg) * 60);
  return `${deg}°${String(min).padStart(2, "0")}′`;
}

function balance() {
  const e = [0, 0, 0, 0];
  const m = [0, 0, 0];
  for (const p of CHART) {
    const si = SN.indexOf(signName(p.lon));
    if (si < 0) continue;
    e[si % 4]++;
    m[si % 3]++;
  }
  return { e, m, total: CHART.length };
}

const TODAY = new Date();

export interface PrintInclude {
  planets: boolean; houses: boolean; aspects: boolean; balance: boolean;
  reading: boolean; points: boolean; transits: boolean; glossary: boolean;
}
export const ALL_CHAPTERS: { key: keyof PrintInclude; label: string }[] = [
  { key: "planets", label: "Planetenstände" },
  { key: "houses", label: "Achsen & Häuser" },
  { key: "aspects", label: "Aspekte" },
  { key: "balance", label: "Element- & Modus-Balance" },
  { key: "reading", label: "Deine Deutung" },
  { key: "points", label: "Mondknoten, Chiron & Lilith" },
  { key: "transits", label: "Aktuelle Transite" },
  { key: "glossary", label: "Zeichen & Symbole" },
];

export function PrintView({ include }: { include?: PrintInclude }) {
  const inc: PrintInclude = include ?? { planets: true, houses: true, aspects: true, balance: true, reading: true, points: true, transits: true, glossary: true };
  const setPrintOpen = useApp((s) => s.setPrintOpen);
  const aspects = [...computeAspects()].sort((a, b) => b.def.w - a.def.w || a.orb - b.orb);
  const verify = getVerification();
  const summary = aiSummary();
  const transits = computeTransits(CHART, TODAY).slice(0, 8);
  const sky = skySummary(TODAY);
  const bal = balance();
  const created = TODAY.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });
  const angles = [
    { key: "asc", name: "Aszendent (AC)", lon: ASC },
    { key: "mc", name: "Medium Coeli (MC)", lon: MC },
  ];

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#2b2740]">
      {/* toolbar */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#15131f]/90 px-4 py-3 backdrop-blur-xl">
        <button onClick={() => setPrintOpen(false)} className="flex items-center gap-2 rounded-pill border border-white/15 px-3.5 py-2 font-body text-[13px] text-white/80">
          <X className="h-4 w-4" /> Schließen
        </button>
        <span className="font-body text-[12px] text-white/55">Vorschau · „Drucken" → Ziel „Als PDF speichern"</span>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-pill bg-cta-gradient px-4 py-2 font-display text-[13px] font-semibold text-white">
          <Printer className="h-4 w-4" /> Drucken / PDF
        </button>
      </div>

      {/* the paper */}
      <div className="print-paper mx-auto my-6 w-[210mm] max-w-[calc(100%-24px)] bg-white px-[18mm] py-[16mm] text-[#1b1830] shadow-2xl">
        {/* ── COVER ── */}
        <header className="print-avoid text-center">
          <div className="font-display text-[11px] font-bold uppercase tracking-[0.3em] text-[#7c5bbf]">Vela · Geburtshoroskop</div>
          <h1 className="mt-3 font-cinzel text-[40px] font-semibold leading-none text-[#1b1830]">{PROFILE.name}</h1>
          <p className="mt-3 font-body text-[13px] text-[#5b5670]">{PROFILE.birth}</p>
          <p className="mt-1 font-body text-[12px] text-[#8b8699]">{PROFILE.memberSince}</p>
        </header>

        <div className="print-ink mx-auto mt-6 w-[112mm] max-w-full rounded-2xl bg-[#0c0a16] p-5">
          <ChartWheel onPick={() => {}} />
        </div>

        {verify && (
          <p className="mt-4 text-center font-body text-[11px] text-[#6c6781]">
            ✓ Berechnung geprüft gegen NASA-NOVAS{typeof verify.max_dev_arcsec === "number" ? ` · Abweichung ${verify.max_dev_arcsec}″` : ""} · erstellt am {created}
          </p>
        )}

        {/* ── PLANETARY POSITIONS ── */}
        <Section show={inc.planets} n="01" title="Planetenstände">
          <Table head={["Planet", "Zeichen", "Grad", "Haus", "Lauf"]}>
            {CHART.map((p) => (
              <tr key={p.key} className="border-t border-[#eceaf2]">
                <Td><Glyph k={p.key} g={p.glyph} /> {p.name}</Td>
                <Td>{signName(p.lon)}</Td>
                <Td className="font-mono text-[11px]">{dms(p.lon)}</Td>
                <Td>{p.house ?? "–"}</Td>
                <Td>{p.retro ? "℞ rückläufig" : "—"}</Td>
              </tr>
            ))}
          </Table>
        </Section>

        {/* ── ANGLES & HOUSES ── */}
        <Section show={inc.houses} n="02" title="Achsen & Häuser">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            {angles.map((a) => (
              <Row key={a.key} l={a.name} r={`${signName(a.lon)} ${dms(a.lon)}`} bold />
            ))}
            {CUSPS.map((c, i) => (
              <Row key={i} l={`${i + 1}. Haus · ${HOUSE[i]}`} r={`${signName(c)} ${dms(c)}`} />
            ))}
          </div>
        </Section>

        {/* ── ASPECTS ── */}
        <Section show={inc.aspects} n="03" title="Aspekte" sub={`${aspects.length} Verbindungen, nach Stärke`}>
          <Table head={["Verbindung", "Aspekt", "Orbis"]}>
            {aspects.map((a) => (
              <tr key={a.key} className="border-t border-[#eceaf2]">
                <Td><Glyph k={a.A.key} g={a.A.glyph} /> {a.A.name} – <Glyph k={a.B.key} g={a.B.glyph} /> {a.B.name}</Td>
                <Td><span className="print-ink rounded px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: `${a.def.c}22`, color: "#43356f" }}>{a.def.g} {a.def.type}</span></Td>
                <Td className="font-mono text-[11px]">{a.orb.toFixed(1)}°</Td>
              </tr>
            ))}
          </Table>
        </Section>

        {/* ── ELEMENT / MODE BALANCE ── */}
        <Section show={inc.balance} n="04" title="Element- & Modus-Balance">
          <div className="grid grid-cols-2 gap-8">
            <BalanceBlock title="Elemente" labels={ELEM as unknown as string[]} values={bal.e} total={bal.total} colors={["#c0392b", "#0a8f73", "#2f7d99", "#3a5bbf"]} />
            <BalanceBlock title="Modi" labels={MODE as unknown as string[]} values={bal.m} total={bal.total} colors={["#7c5bbf", "#b8860b", "#0a8f73"]} />
          </div>
        </Section>

        {/* ── READING ── */}
        <Section show={inc.reading} n="05" title="Deine Deutung" breakBefore>
          {summary && <p className="font-body text-[13px] leading-relaxed text-[#2a2640]">{summary}</p>}
          <div className={`${summary ? "mt-4" : ""} space-y-3`}>
            {CHART.map((p) => {
              const t = aiSign(p.key) || p.txt;
              const h = aiHouse(p.key);
              if (!t && !h) return null;
              return (
                <div key={p.key} className="print-avoid">
                  <div className="font-display text-[13px] font-semibold text-[#1b1830]">
                    <Glyph k={p.key} g={p.glyph} /> {p.name} · {signName(p.lon)} · {p.house}. Haus
                  </div>
                  {t && <p className="mt-0.5 font-body text-[12.5px] leading-relaxed text-[#454059]">{t}</p>}
                  {h && <p className="mt-0.5 font-body text-[12.5px] leading-relaxed text-[#454059]">{h}</p>}
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── NODES / CHIRON / LILITH ── */}
        <Section show={inc.points} n="06" title="Mondknoten, Chiron & Lilith">
          <div className="space-y-2.5">
            {[...NODES, ...CHART.filter((p) => p.key === "chiron" || p.key === "lilith")].map((p) => (
              <div key={p.key} className="print-avoid">
                <div className="font-display text-[13px] font-semibold text-[#1b1830]"><Glyph k={p.key} g={p.glyph} /> {p.name} · {signName(p.lon)} · {p.house}. Haus</div>
                {PINFO[p.key] && <p className="mt-0.5 font-body text-[12.5px] leading-relaxed text-[#454059]">{PINFO[p.key].what}</p>}
              </div>
            ))}
          </div>
        </Section>

        {/* ── TRANSITS ── */}
        <Section show={inc.transits} n="07" title="Aktuelle Transite" sub={`Stand ${created} · Mond in ${sky.moonSign}, Sonne in ${sky.sunSign}${sky.retro.length ? ` · rückläufig: ${sky.retro.map((r) => r.name).join(", ")}` : ""}`}>
          {transits.length ? (
            <div className="space-y-2.5">
              {transits.map((t, i) => (
                <div key={i} className="print-avoid">
                  <div className="font-display text-[13px] font-semibold text-[#1b1830]">{t.tGlyph} {t.tName} {t.type} {t.nName} <span className="font-mono text-[11px] font-normal text-[#8b8699]">· {t.orb.toFixed(1)}°</span></div>
                  <p className="mt-0.5 font-body text-[12.5px] leading-relaxed text-[#454059]">{t.txt}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-[12.5px] text-[#6c6781]">Gerade keine engen Transite — eine ruhige Phase.</p>
          )}
        </Section>

        {/* ── GLOSSARY ── */}
        <Section show={inc.glossary} n="08" title="Zeichen & Symbole">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <div className="mb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#7c5bbf]">Planeten</div>
              <div className="grid grid-cols-2 gap-y-1">
                {CHART.map((p) => (
                  <div key={p.key} className="font-body text-[11.5px] text-[#454059]"><Glyph k={p.key} g={p.glyph} /> {p.name}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#7c5bbf]">Aspekte</div>
              <div className="grid grid-cols-1 gap-y-1">
                {ASPDEF.map((d) => (
                  <div key={d.type} className="font-body text-[11.5px] text-[#454059]"><span className="font-glyph">{d.g}</span> {d.type} — {d.plain}</div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <footer className="mt-8 border-t border-[#eceaf2] pt-3 text-center font-body text-[10px] text-[#9b96a9]">
          Erstellt mit Vela · {created} · Dieses Horoskop ist zur Selbstreflexion gedacht und ersetzt keine medizinische, psychologische oder finanzielle Beratung.
        </footer>
      </div>
    </div>
  );
}

/* ── building blocks ── */
function Glyph({ k, g }: { k: string; g: string }) {
  return <span className="font-glyph" style={{ color: col(k) }}>{g}</span>;
}
function Section({ n, title, sub, children, breakBefore, show = true }: { n: string; title: string; sub?: string; children: React.ReactNode; breakBefore?: boolean; show?: boolean }) {
  if (!show) return null;
  return (
    <section className={`mt-8 ${breakBefore ? "print-break" : ""}`}>
      <div className="mb-3 flex items-baseline gap-2 border-b-2 border-[#1b1830] pb-1.5">
        <span className="font-mono text-[11px] text-[#7c5bbf]">{n}</span>
        <h2 className="font-cinzel text-[17px] font-semibold text-[#1b1830]">{title}</h2>
      </div>
      {sub && <p className="mb-2.5 font-body text-[11px] text-[#6c6781]">{sub}</p>}
      {children}
    </section>
  );
}
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr>{head.map((h) => <th key={h} className="pb-1.5 font-display text-[10px] font-bold uppercase tracking-[0.08em] text-[#8b8699]">{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`py-1.5 pr-3 align-top font-body text-[12px] text-[#2a2640] ${className}`}>{children}</td>;
}
function Row({ l, r, bold }: { l: string; r: string; bold?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 border-b border-[#f0eef5] py-1 ${bold ? "font-semibold" : ""}`}>
      <span className="font-body text-[12px] text-[#454059]">{l}</span>
      <span className="font-mono text-[11px] text-[#1b1830]">{r}</span>
    </div>
  );
}
function BalanceBlock({ title, labels, values, total, colors }: { title: string; labels: string[]; values: number[]; total: number; colors: string[] }) {
  return (
    <div>
      <div className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#7c5bbf]">{title}</div>
      <div className="space-y-1.5">
        {labels.map((l, i) => (
          <div key={l} className="flex items-center gap-2">
            <span className="w-24 font-body text-[12px] text-[#454059]">{l}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f0eef5]">
              <div className="print-ink h-full rounded-full" style={{ width: `${total ? (values[i] / total) * 100 : 0}%`, background: colors[i] }} />
            </div>
            <span className="w-5 text-right font-mono text-[11px] text-[#1b1830]">{values[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
