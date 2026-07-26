import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, ChevronDown, Loader2, Sparkles, X } from "lucide-react";
import { useApp } from "@/store/useApp";
import { LAYER } from "@/lib/layers";
import { EASE } from "@/lib/tokens";
import { GenerativeLoader } from "@/components/GenerativeLoader";
import { askSuggestions, belege, followUps, type AskSuggestion } from "@/lib/askSuggestions";

/**
 * "Frag dein Horoskop" — the product hook, ALWAYS visible on every tab as a
 * floating prompt input above the tab bar. Focusing it (or an answer arriving)
 * reveals the example chips + the answer above the bar. No FAB.
 */
export function Composer() {
  const tab = useApp((s) => s.tab);
  const open = useApp((s) => s.composerOpen);
  const setOpen = useApp((s) => s.setComposerOpen);
  const q = useApp((s) => s.q);
  const setQ = useApp((s) => s.setQ);
  const ask = useApp((s) => s.ask);
  const answer = useApp((s) => s.answer);
  const demo = useApp((s) => s.demo);
  const loading = useApp((s) => s.loading);
  const clearAnswer = useApp((s) => s.clearAnswer);
  const chartVersion = useApp((s) => s.chartVersion);
  const verlauf = useApp((s) => s.verlauf);
  const clearVerlauf = useApp((s) => s.clearVerlauf);
  const openSheet = useApp((s) => s.openSheet);
  const [zeigeVerlauf, setZeigeVerlauf] = useState(false);
  /** die zuletzt abgeschickte Frage — für die Anschlussfragen und als
   *  Überschrift über der Antwort */
  const [gefragt, setGefragt] = useState("");

  const expanded = open || !!answer || loading;
  // Vorschläge kommen aus DIESEM Chart. `chartVersion` als Abhängigkeit,
  // damit sie nach dem Berechnen eines Charts neu abgeleitet werden.
  const vorschlaege = useMemo(() => askSuggestions(tab), [tab, chartVersion]);
  const weiter = useMemo(() => (answer ? followUps(gefragt) : []), [answer, gefragt, chartVersion]);
  // C3 · worauf sich die Antwort stützt — aus dem Antworttext gelesen, damit
  // auch frei getippte Fragen ihre Belege bekommen.
  const quellen = useMemo(() => belege(answer), [answer]);
  const frueher = verlauf.slice(0, -1); // alles außer der gerade sichtbaren

  const frage = (s: AskSuggestion | string) => {
    const text = typeof s === "string" ? s : s.q;
    setGefragt(text);
    setQ(text);
    void ask(text);
  };

  return (
    <div style={{ zIndex: LAYER.composer }}
      className="pointer-events-none fixed inset-x-0 bottom-0 mx-auto w-[min(440px,calc(100%-24px))] pb-[max(env(safe-area-inset-bottom),14px)] lg:left-0 lg:right-0 lg:mx-auto lg:w-auto lg:max-w-[640px] lg:px-6 lg:pb-6">
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.26, ease: EASE.smooth }}
            className="pointer-events-auto mb-2.5"
          >
            {loading && !answer && (
              <div className="mb-2.5 rounded-[20px] bg-[rgba(18,18,29,0.94)] p-4 shadow-glass backdrop-blur-xl">
                <GenerativeLoader
                  messages={[
                    "Vela liest dein Bild …",
                    "Deine Frage trifft dein Chart …",
                    "Einen Moment — ich prüfe dein Chart …",
                  ]}
                  widths={[100, 88, 94]}
                />
              </div>
            )}
            {/* ANTWORT ALS KARTE — nicht als Sprechblase. Eyebrow „Vela deutet",
                darunter der Text, darunter Anschlussfragen. Kein max-h-56 mehr:
                eine Deutung, die man wegscrollen muss, wirkt wie eine Fußnote. */}
            {answer && (
              <div className="mb-2.5 max-h-[62vh] overflow-y-auto rounded-[20px] p-[18px] shadow-[inset_0_0_0_1px_rgba(120,150,255,0.28)]" style={{ background: "linear-gradient(180deg,#1A1828 0%,#141221 100%)" }}>
                <div className="mb-2.5 flex items-start justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-lilac">
                    <Sparkles className="h-3.5 w-3.5" /> Vela deutet
                  </span>
                  <button onClick={clearAnswer} title="Schließen" className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-txt-3 transition hover:text-txt">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* C4 · frühere Fragen dieser Sitzung — zusammengeklappt, damit
                    der Verlauf da ist, ohne die aktuelle Antwort zu verdrängen */}
                {frueher.length > 0 && (
                  <div className="mb-3">
                    <button
                      onClick={() => setZeigeVerlauf((v) => !v)}
                      className="flex w-full items-center justify-between gap-2 rounded-[14px] px-2.5 py-1.5 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-txt-3 transition hover:text-txt-2"
                    >
                      <span>{frueher.length} {frueher.length === 1 ? "frühere Frage" : "frühere Fragen"}</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${zeigeVerlauf ? "rotate-180" : ""}`} />
                    </button>
                    {zeigeVerlauf && (
                      <div className="mt-2 space-y-3 border-l border-line-soft pl-3">
                        {frueher.map((v, i) => (
                          <div key={i}>
                            <div className="font-body text-[12px] font-medium text-txt-2">{v.frage}</div>
                            <p className="mt-1 line-clamp-3 font-body text-[12px] leading-[1.55] text-txt-3">{v.antwort}</p>
                          </div>
                        ))}
                        <button onClick={clearVerlauf} className="font-body text-[11px] text-txt-3 underline transition hover:text-txt-2">Verlauf leeren</button>
                      </div>
                    )}
                  </div>
                )}
                {gefragt && <div className="mb-2 font-cinzel text-[15px] font-normal uppercase leading-snug tracking-[0.02em] text-txt">{gefragt}</div>}
                <p className="whitespace-pre-line font-body text-[15px] leading-[1.65] text-txt-2">{answer}</p>
                {/* C3 · Belege — antippbar, öffnet die jeweilige Stellung. Das
                    ist der Unterschied zu The Pattern: die Astrologie ist da,
                    wenn man sie sehen will, statt komplett versteckt. */}
                {quellen.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                    <span className="font-body text-[11px] text-txt-3">gelesen aus</span>
                    {quellen.map((b) => (
                      <button
                        key={b.label}
                        onClick={() => openSheet(b.sheet)}
                        className="rounded-pill px-2.5 py-1 font-body text-[11px] text-txt-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.13)] transition hover:text-txt hover:shadow-[inset_0_0_0_1px_rgba(120,150,255,0.42)]"
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                )}
                {weiter.length > 0 && (
                  <div className="mt-4 border-t border-line-soft pt-3.5">
                    <div className="mb-2 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-txt-3">Weiterfragen</div>
                    <div className="flex flex-col gap-1.5">
                      {weiter.map((s) => (
                        <button
                          key={s.q}
                          onClick={() => frage(s)}
                          className="rounded-[14px] px-3 py-2.5 text-left font-body text-[13px] leading-snug text-txt-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.13)] transition hover:text-txt hover:shadow-[inset_0_0_0_1px_rgba(120,150,255,0.34)]"
                        >
                          {s.q}
                          <span className="mt-1 block font-body text-[11px] text-txt-3">aus {s.from}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {demo && <div className="mt-3 font-body text-[11px] text-txt-3">Vela · aus deinem Chart</div>}
              </div>
            )}
            {/* VORSCHLÄGE — aus DIESEM Chart abgeleitet, nicht aus einer festen
                Liste. Mit der Stellung darunter, aus der die Frage folgt. */}
            {!loading && !answer && (
              <div className="flex flex-col gap-1.5 pb-1">
                {vorschlaege.map((s) => (
                  <button
                    key={s.q}
                    onClick={() => frage(s)}
                    className="rounded-[16px] bg-[rgba(22,22,31,0.92)] px-3.5 py-2.5 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.13)] backdrop-blur-md transition hover:shadow-[inset_0_0_0_1px_rgba(120,150,255,0.4)] active:scale-[0.99]"
                  >
                    <span className="block font-body text-[13px] leading-snug text-txt">{s.q}</span>
                    <span className="mt-0.5 block font-body text-[11px] text-txt-3">aus {s.from}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* the always-visible prompt input, floating above the nav */}
      <div className="pointer-events-auto flex items-center gap-2 rounded-pill border border-white/[0.14] bg-[rgba(22,22,31,0.9)] py-2 pl-4 pr-2 shadow-[0_14px_44px_-12px_rgba(0,0,0,0.7),0_0_26px_-12px_rgba(120,150,255,0.55)] backdrop-blur-xl">
        <Sparkles className="h-4 w-4 shrink-0 text-[#7896FF]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && q.trim() && frage(q)}
          placeholder="Frag dein Horoskop …"
          className="min-w-0 flex-1 bg-transparent font-body text-[15px] text-ink-soft outline-none placeholder:text-ink-soft/45"
        />
        {(open || q) && (
          <button
            onClick={() => {
              setOpen(false);
              setQ("");
              clearAnswer();
            }}
            title="Zurücksetzen"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-txt-3 transition hover:text-txt"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => q.trim() && frage(q)}
          disabled={loading || !q.trim()}
          title="Fragen"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cta-gradient text-[#ffffff] shadow-glow transition active:scale-90 disabled:opacity-45"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" strokeWidth={2.6} />}
        </button>
      </div>
    </div>
  );
}
