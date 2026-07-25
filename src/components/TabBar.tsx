import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp, type TabKey } from "@/store/useApp";
import { cn } from "@/lib/utils";
import { Sparkles, Orbit, Heart, BookOpen, User, Menu, X } from "lucide-react";

const TABS: { key: TabKey; label: string; Icon: typeof Sparkles }[] = [
  { key: "heute", label: "Home", Icon: Sparkles },
  { key: "transite", label: "Transite", Icon: Orbit },
  { key: "synastrie", label: "Synastrie", Icon: Heart },
  { key: "lernen", label: "Lernen", Icon: BookOpen },
  { key: "profil", label: "Profil", Icon: User },
];

/**
 * Burger-Menü (Lauras Vorgabe: keine Rail, keine Bottom-Nav). Ein schwebender
 * Glas-Button oben rechts öffnet ein kompaktes Menü mit den fünf Tabs; die
 * Auswahl navigiert und schließt. Chrome bleibt aus dem Weg, bis man es braucht.
 */
export function TabBar() {
  const tab = useApp((s) => s.tab);
  const setTab = useApp((s) => s.setTab);
  const [open, setOpen] = useState(false);

  const go = (key: TabKey) => {
    setTab(key);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={open}
        className="fixed right-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.10] bg-[rgba(13,26,34,0.55)] text-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.10)] [backdrop-filter:blur(20px)_saturate(130%)] transition-colors hover:bg-[rgba(18,34,44,0.7)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "menu"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.18 }}
            className="flex"
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.9} /> : <Menu className="h-5 w-5" strokeWidth={1.9} />}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-[rgba(6,5,10,0.55)] [backdrop-filter:blur(6px)]"
            />
            <motion.nav
              key="menu"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 480, damping: 34 }}
              style={{ transformOrigin: "top right" }}
              className="fixed right-4 top-[68px] z-[60] flex w-[224px] flex-col gap-1 rounded-[22px] border border-white/[0.10] bg-[rgba(13,26,34,0.72)] p-2 shadow-[0_28px_60px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.10)] [backdrop-filter:blur(28px)_saturate(140%)]"
            >
              {TABS.map(({ key, label, Icon }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => go(key)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                      active ? "bg-[rgba(120,150,255,0.14)]" : "hover:bg-white/[0.05]",
                    )}
                  >
                    {active && (
                      <span className="absolute inset-0 rounded-2xl border border-[rgba(120,150,255,0.45)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
                    )}
                    <Icon
                      className={cn(
                        "relative h-[19px] w-[19px]",
                        active ? "text-[#8fe8f8]" : "text-[rgba(198,220,230,0.65)] group-hover:text-ink",
                      )}
                      strokeWidth={active ? 2.1 : 1.7}
                    />
                    <span
                      className={cn(
                        "relative font-body text-[15px] font-medium tracking-wide",
                        active ? "text-[#97B5FF]" : "text-[rgba(226,236,242,0.82)]",
                      )}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
