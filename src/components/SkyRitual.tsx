import { useEffect, useState } from "react";
import { ChartWheel } from "@/components/ChartWheel";

const MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

/**
 * Das Einrasten (Journey Map, Kapitel III / Schlüsselmoment i): Nach der
 * Geburtsdaten-Eingabe dreht der Himmel sichtbar zurück bis zum Geburts-
 * moment und rastet ein — die Jahre laufen mit. Copy-Lock: "So stand der
 * Himmel, als du deinen ersten Atemzug nahmst."
 */
export function SkyRitual({ name, date, time, place, timeUnknown, onDone }: { name?: string; date: string; time: string; place: string; timeUnknown?: boolean; onDone: () => void }) {
  const [y, m, d] = date.split("-").map(Number);
  const [year, setYear] = useState(new Date().getFullYear());

  // Jahres-Countdown parallel zur Rad-Drehung (ease-out, ~4.2s)
  useEffect(() => {
    const now = new Date().getFullYear();
    const span = Math.max(1, now - y);
    const D = 4200;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / D);
      const eased = 1 - Math.pow(1 - p, 3);
      setYear(Math.round(now - span * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [y]);

  return (
    <div className="fixed inset-0 z-[92] flex flex-col overflow-y-auto bg-[#0B0A12]">
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 h-[380px]" style={{ background: "radial-gradient(120% 90% at 50% 118%, rgba(120,150,255,.45) 0%, rgba(120,157,255,.18) 42%, transparent 72%)" }} />
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[560px] flex-col items-center px-7 pb-8 pt-[calc(env(safe-area-inset-top,0px)+26px)]">
        {/* Journey Map III: das Ritual ist ein Angebot, kein Zwang */}
        <button onClick={onDone} className="absolute right-6 top-[max(20px,env(safe-area-inset-top))] font-body text-[12px] text-white/45 transition hover:text-white/80">
          Überspringen
        </button>
        <span className="v-eyebrow tracking-[2.4px]">Dein Moment</span>
        <div className="flex flex-1 flex-col items-center justify-center gap-7 py-6">
          <div className="vela-skyturn pointer-events-none w-[min(76vw,300px)]">
            <ChartWheel />
          </div>
          <div className="text-center">
            <div className="font-body text-[10.5px] uppercase tracking-[2.4px] text-[rgba(151,181,255,0.75)]">Der Himmel dreht zurück · {year}</div>
            {/* Copy-Lock (Journey Map, Sprach-Checkpoints) — Wortlaut nicht ändern */}
            <p className="mx-3 mt-3.5 font-cinzel text-[21px] uppercase leading-[1.45] tracking-[0.07em] text-white">
              So stand der Himmel,<br />als du deinen ersten<br />
              <em className="not-italic normal-case" style={{ fontFamily: '"Cinzel Decorative", "Cinzel", serif', letterSpacing: "-0.02em", textShadow: "var(--glow-lit)" }}>Atemzug</em> nahmst.
            </p>
            <p className="mt-3.5 font-body text-[12.5px] text-[rgba(238,245,248,0.5)]">
              {d}. {MON[m - 1]} {y} · {timeUnknown ? "Zeit unbekannt" : time} · {place.split(",")[0]}
              {name ? ` · ${name}` : ""}
            </p>
          </div>
        </div>
        <button onClick={onDone} className="btn-moon w-full px-5 py-3.5 font-display text-[14px] font-semibold transition active:scale-[0.98]">
          Mein Chart öffnen
        </button>
      </div>
    </div>
  );
}
