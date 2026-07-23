import { useMemo, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { ASC, CHART, HOUSE, NODES, SG, SN, houseOf } from "@/lib/data";
import { resolveSheet, type SheetDescriptor } from "@/lib/sheets";
import { useApp } from "@/store/useApp";

/**
 * Sign Portal (HiFi-Konzept "VELA - Sign Portal HiFi"): volle Poster-Bühne
 * pro Tierkreiszeichen, unten der drehbare Tierkreis-Bogen. "Einfluss" zeigt
 * die ECHTEN Stände dieses Charts im Zeichen — jede Zeile öffnet das
 * bestehende Erklär-Sheet (Portal liegt auf z-60, Sheets auf z-70/88).
 * Artwork-Slots: aktuell Glyph-Variante; PNG-Poster pro Zeichen können später
 * in src/assets/ gelegt und hier eingehängt werden.
 */
const EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const DATES = ["Mär 21 – Apr 19", "Apr 20 – Mai 20", "Mai 21 – Jun 20", "Jun 21 – Jul 22", "Jul 23 – Aug 22", "Aug 23 – Sep 22", "Sep 23 – Okt 22", "Okt 23 – Nov 21", "Nov 22 – Dez 21", "Dez 22 – Jan 19", "Jan 20 – Feb 18", "Feb 19 – Mär 20"];
const META = ["Feuer · Kardinal · Mars", "Erde · Fix · Venus", "Luft · Veränderlich · Merkur", "Wasser · Kardinal · Mond", "Feuer · Fix · Sonne", "Erde · Veränderlich · Merkur", "Luft · Kardinal · Venus", "Wasser · Fix · Pluto", "Feuer · Veränderlich · Jupiter", "Erde · Kardinal · Saturn", "Luft · Fix · Uranus", "Wasser · Veränderlich · Neptun"];
const TRAITS = ["Direkt, Mutig, Ungeduldig", "Beharrlich, Sinnlich, Stur", "Wach, Beweglich, Zerstreut", "Fürsorglich, Empfänglich, Nachtragend", "Warm, Stolz, Sichtbar", "Präzise, Dienend, Kritisch", "Ausgleichend, Ästhetisch, Unentschieden", "Intuitiv, Beharrlich, Leidenschaftlich", "Weit, Ehrlich, Rastlos", "Verantwortlich, Zäh, Streng", "Eigenwillig, Klar, Distanziert", "Träumerisch, Hellsichtig, Durchlässig"];

const signIdx = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30);

interface Row {
  glyph: string;
  title: string;
  meta: string;
  sheet: SheetDescriptor;
}

/** Eine "Einfluss"-Zeile: Accordion mit der persönlichen Deutung, "Mehr" öffnet das Sheet. */
function InfluenceRow({ row, open, onToggle }: { row: Row; open: boolean; onToggle: () => void }) {
  const openInfo = useApp((s) => s.openInfo);
  const body = useMemo(() => {
    const sheet = resolveSheet(row.sheet);
    return sheet?.sections.find((s) => s.accent)?.body ?? sheet?.sections[0]?.body ?? "";
  }, [row.sheet]);
  return (
    <div
      onClick={onToggle}
      className="cursor-pointer rounded-[14px] transition-all"
      style={{
        padding: open ? "14px 16px 15px" : "12px 16px",
        background: open ? "linear-gradient(180deg,#1B1926 0%,#151420 100%)" : "linear-gradient(180deg,#16161F 0%,#12121D 100%)",
        boxShadow: open ? "inset 0 0 0 1px rgba(120,150,255,.32)" : "inset 0 0 0 1px rgba(255,255,255,.07)",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="vela-glyph inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] transition-all"
          style={{
            background: open ? "rgba(120,150,255,.14)" : "rgba(248,247,242,.05)",
            boxShadow: open ? "inset 0 0 0 1px rgba(120,150,255,.4)" : "inset 0 0 0 1px rgba(255,255,255,.14)",
            color: open ? "#97B5FF" : "rgba(255,255,255,.75)",
          }}
        >
          {row.glyph}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-body text-[14px] font-medium text-txt">{row.title}</div>
          <div className="mt-[3px] font-body text-[9.5px] uppercase tracking-[1.8px] transition-colors" style={{ color: open ? "rgba(151,181,255,.75)" : "rgba(255,255,255,.38)" }}>
            {row.meta}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </div>
      {open && (
        <div className="vela-fadeup mt-3 border-t border-white/[0.07] pt-3">
          {body && <p className="font-body text-[13px] leading-[1.6] text-[rgba(238,245,248,0.66)]">{body}</p>}
          <button
            onClick={(e) => { e.stopPropagation(); openInfo(row.sheet); }}
            className="mt-2.5 font-body text-[12px] text-[#97B5FF]"
          >
            Ganzes Sheet öffnen →
          </button>
        </div>
      )}
    </div>
  );
}

/** Der drehbare Tierkreis-Bogen am unteren Rand: Zeichen antippen → Rad dreht hin. */
function ZodiacArc({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  const R = 225;
  const mask = "linear-gradient(180deg,#000 72%,transparent 100%)";
  return (
    <div className="relative h-[112px] overflow-hidden" style={{ maskImage: mask, WebkitMaskImage: mask }}>
      <div aria-hidden className="absolute left-1/2 top-[10px] z-[1] h-[62px] w-[62px] -translate-x-1/2 rounded-full" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.35)", background: "rgba(255,255,255,.04)" }} />
      <div className="absolute left-1/2" style={{ top: 14, width: R * 2, height: R * 2, marginLeft: -R, transform: `rotate(${-active * 30}deg)`, transition: "transform .7s cubic-bezier(.22,1,.36,1)" }}>
        <div aria-hidden className="absolute rounded-full" style={{ inset: 27, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)" }} />
        {SN.map((n, i) => {
          const a = ((i * 30 - 90) * Math.PI) / 180;
          const x = R + Math.cos(a) * (R - 27);
          const y = R + Math.sin(a) * (R - 27);
          const on = i === active;
          return (
            <button
              key={n}
              onClick={() => onSelect(i)}
              aria-label={n}
              className="vela-glyph absolute flex h-11 w-11 items-center justify-center"
              style={{ left: x - 22, top: y - 22, background: "none", border: "none", cursor: "pointer", color: on ? "#fff" : "rgba(255,255,255,.34)", transform: `rotate(${i * 30}deg)`, transition: "color .4s, font-size .4s, filter .4s", fontSize: on ? 25 : 18, filter: on ? "drop-shadow(0 0 8px rgba(151,181,255,.7))" : "none", padding: 0 }}
            >
              {SG[i]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SignPortal({ initial, onClose }: { initial: number; onClose: () => void }) {
  const [sign, setSign] = useState(initial);
  const [open, setOpen] = useState(0);
  const select = (i: number) => { setSign(i); setOpen(0); };

  const rows = useMemo<Row[]>(() => {
    const r: Row[] = CHART.filter((p) => signIdx(p.lon) === sign).map((p) => {
      const h = p.house ?? houseOf(p.lon);
      return { glyph: p.glyph, title: `${p.name} in ${SN[sign]}`, meta: `${h}. Haus · ${HOUSE[h - 1]}`, sheet: { kind: "planet", key: p.key } };
    });
    for (const n of NODES) {
      if (signIdx(n.lon) === sign) {
        const h = n.house ?? houseOf(n.lon);
        r.push({ glyph: n.glyph, title: `${n.name} in ${SN[sign]}`, meta: `${h}. Haus · ${HOUSE[h - 1]}`, sheet: { kind: "node", key: n.key } });
      }
    }
    if (signIdx(ASC) === sign) {
      r.unshift({ glyph: "↑", title: `Aszendent ${SN[sign]}`, meta: "1. Haus · Auftritt", sheet: { kind: "sign", key: SN[sign] } });
    }
    return r;
  }, [sign]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[#000004]">
      {/* Bühne: Glyph-Variante (Artwork-Slot) + Horizont-Scrim */}
      <div key={sign} aria-hidden className="vela-fadeup pointer-events-none fixed inset-0">
        <div className="absolute inset-0" style={{ background: "radial-gradient(90% 55% at 50% 30%, rgba(120,150,255,.16), transparent 70%)" }} />
        <span className="vela-glyph absolute left-1/2 top-[26%] -translate-x-1/2 -translate-y-1/2 leading-none" style={{ fontSize: "min(44vw,170px)", color: "rgba(200,182,255,.5)", filter: "drop-shadow(0 0 34px rgba(120,150,255,.55))" }}>
          {SG[sign]}
        </span>
        <div className="absolute inset-x-0 bottom-0 h-[56%]" style={{ background: "linear-gradient(180deg, rgba(0,0,4,0) 0%, rgba(0,0,4,.55) 50%, rgba(0,0,4,.94) 100%)" }} />
      </div>

      <button onClick={onClose} aria-label="Schließen" className="fixed right-5 top-[max(20px,env(safe-area-inset-top))] z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] backdrop-blur-md active:scale-90">
        <X className="h-5 w-5" />
      </button>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[560px] flex-col pb-[calc(env(safe-area-inset-bottom,0px)+150px)]">
        <div className="mt-[calc(env(safe-area-inset-top,0px)+22px)] text-center font-body text-[10px] uppercase tracking-[4px] text-white/50">{DATES[sign]}</div>
        <div className="min-h-[24vh] flex-1" />

        <div key={"t" + sign} className="vela-fadeup px-8 text-center">
          <h1 className="font-cinzel text-[38px] font-normal uppercase leading-none text-white" style={{ letterSpacing: ".16em", paddingLeft: ".16em", textShadow: "0 0 32px rgba(120,100,220,.45)" }}>
            {EN[sign]}
          </h1>
          <div className="mt-2.5 font-body text-[10px] uppercase tracking-[4.5px] text-white/[0.78]">{META[sign]}</div>
          <p className="mt-2.5 font-body text-[10px] uppercase leading-loose tracking-[2.6px] text-white/[0.48]">{TRAITS[sign]}</p>
        </div>

        <div key={"a" + sign} className="vela-fadeup flex flex-col gap-2 px-5 pb-1 pt-4">
          <div className="flex items-baseline justify-between px-1">
            {/* Label "Einfluss" statt "Bei dir" (Laura, 2026-07-23) */}
            <span className="font-body text-[10px] uppercase tracking-[2px] text-white/[0.65]">Einfluss</span>
            <span className="font-body text-[11px] text-white/40">aus deinem Chart</span>
          </div>
          {rows.length ? (
            rows.map((row, i) => <InfluenceRow key={row.title} row={row} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />)
          ) : (
            <div className="rounded-[14px] px-4 py-3 font-body text-[13px] leading-[1.6] text-[rgba(238,245,248,0.6)]" style={{ background: "linear-gradient(180deg,#16161F 0%,#12121D 100%)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.07)" }}>
              Kein Planet steht bei dir in {SN[sign]} — dieser Bereich ist kein Dauerthema. Er meldet sich, wenn Transite ihn berühren.
            </div>
          )}
        </div>

        <div className="mt-2">
          <ZodiacArc active={sign} onSelect={select} />
        </div>
      </div>
    </div>
  );
}
