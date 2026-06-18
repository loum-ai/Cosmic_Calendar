import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ArrowUp, Loader2 } from "lucide-react";
import { useApp, type TabKey } from "@/store/useApp";
import { EASE } from "@/lib/tokens";

/** Context-aware suggested questions per screen. */
const EXAMPLES: Record<TabKey, string[]> = {
  heute: ["Was macht mich aus?", "Wie liebe ich?", "Wo liegt meine Kraft?"],
  transite: ["Was löst der Himmel heute aus?", "Guter Tag für Neues?", "Worauf soll ich achten?"],
  synastrie: ["Passen wir zusammen?", "Wo reiben wir uns?", "Was verbindet uns?"],
  lernen: ["Was ist ein Aspekt?", "Erklär mir die Häuser", "Was sind Mondknoten?"],
  profil: ["Fasse mein Chart zusammen", "Was ist mein Thema?", "Mein größtes Talent?"],
};

/**
 * "Frag dein Horoskop" — the product hook, available on every tab.
 * Closed: a pulsing FAB. Open: example pills + a glassy glowing input bar
 * (mirrors the loum.ai Oracle look) + the answer.
 */
export function Composer() {
  const tab = useApp((s) => s.tab);
  const open = useApp((s) => s.composerOpen);
  const setOpen = useApp((s) => s.setComposerOpen);
  const q = useApp((s) => s.q);
  const setQ = useApp((s) => s.setQ);
  const ask = useApp((s) => s.ask);
  const answer = useApp((s) => s.answer);
  const loading = useApp((s) => s.loading);
  const clearAnswer = useApp((s) => s.clearAnswer);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[74px] z-[41] mx-auto max-w-[480px]">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="open"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: EASE.smooth }}
            className="pointer-events-auto bg-[linear-gradient(180deg,transparent,rgba(5,5,10,0.86)_60%)] px-3.5 pb-2 pt-3 backdrop-blur-md"
          >
            {answer && (
              <div className="mb-2 max-h-44 overflow-y-auto rounded-card border border-lilac/25 bg-[rgba(20,16,32,0.92)] p-3.5 font-body text-[13px] font-light leading-relaxed text-ink/85">
                {answer}
              </div>
            )}
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {EXAMPLES[tab].map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQ(ex);
                    void ask(ex);
                  }}
                  className="shrink-0 whitespace-nowrap rounded-pill border border-lilac/30 bg-white/[0.06] px-3 py-2 font-body text-[11px] text-ink-soft/85 transition active:scale-95"
                >
                  {ex}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 rounded-pill border border-lilac/30 bg-[rgba(28,24,42,0.92)] py-1.5 pl-2 pr-1.5 shadow-[0_10px_32px_-10px_rgba(120,90,200,0.55)] backdrop-blur-md">
              <button
                onClick={() => {
                  setOpen(false);
                  clearAnswer();
                }}
                title="Minimieren"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lilac/70 active:scale-90"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask()}
                placeholder="Frag dein Horoskop…"
                className="min-w-0 flex-1 bg-transparent font-body text-[13px] text-ink-soft outline-none placeholder:text-ink-soft/40"
              />
              <button
                onClick={() => ask()}
                disabled={loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cta-gradient text-space-2 active:scale-90 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="closed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex justify-end px-4"
          >
            <button
              onClick={() => setOpen(true)}
              title="Frag dein Horoskop"
              className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-cta-gradient text-white shadow-glow transition active:scale-90"
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
