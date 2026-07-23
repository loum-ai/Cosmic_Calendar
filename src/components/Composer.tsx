import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Loader2, Sparkles, X } from "lucide-react";
import { useApp, type TabKey } from "@/store/useApp";
import { EASE } from "@/lib/tokens";
import { GenerativeLoader } from "@/components/GenerativeLoader";

/** Context-aware suggested questions per screen. */
const EXAMPLES: Record<TabKey, string[]> = {
  heute: ["Was macht mich aus?", "Wie liebe ich?", "Wo liegt meine Kraft?"],
  transite: ["Was löst der Himmel heute aus?", "Guter Tag für Neues?", "Worauf soll ich achten?"],
  synastrie: ["Passen wir zusammen?", "Wo reiben wir uns?", "Was verbindet uns?"],
  lernen: ["Was ist ein Aspekt?", "Erklär mir die Häuser", "Was sind Mondknoten?"],
  profil: ["Fasse mein Chart zusammen", "Was ist mein Thema?", "Mein größtes Talent?"],
};

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

  const expanded = open || !!answer || loading;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[92px] z-[41] mx-auto w-[min(440px,calc(100%-24px))] lg:bottom-6 lg:left-[120px] lg:right-0 lg:mx-auto lg:w-auto lg:max-w-[640px] lg:px-6">
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
              <div className="mb-2.5 rounded-[24px] border border-white/10 bg-[rgba(18,18,29,0.94)] p-4 shadow-glass backdrop-blur-xl">
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
            {answer && (
              <div className="mb-2.5 max-h-56 overflow-y-auto rounded-[24px] border border-white/10 bg-[rgba(18,18,29,0.94)] p-4 shadow-glass backdrop-blur-xl">
                <div className="mb-2 flex items-center justify-between gap-2">
                  {demo ? (
                    <span className="inline-flex items-center gap-1.5 rounded-pill border border-[rgba(120,150,255,0.35)] bg-[rgba(120,150,255,0.12)] px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[rgba(120,150,255,0.95)]">
                      Vela · aus deinem Chart
                    </span>
                  ) : (
                    <span />
                  )}
                  <button onClick={clearAnswer} title="Schließen" className="flex h-6 w-6 items-center justify-center rounded-full text-txt-3 transition hover:text-txt">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="font-body text-[15px] font-light leading-relaxed text-ink/90">{answer}</p>
              </div>
            )}
            {!loading && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {EXAMPLES[tab].map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQ(ex);
                    void ask(ex);
                  }}
                  className="shrink-0 whitespace-nowrap rounded-pill border border-white/[0.12] bg-white/[0.06] px-3.5 py-2 font-body text-[12.5px] text-ink-soft/85 backdrop-blur-md transition hover:border-[rgba(120,150,255,0.4)] active:scale-95"
                >
                  {ex}
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
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Frag dein Horoskop …"
          className="min-w-0 flex-1 bg-transparent font-body text-[14px] text-ink-soft outline-none placeholder:text-ink-soft/45"
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
          onClick={() => ask()}
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
