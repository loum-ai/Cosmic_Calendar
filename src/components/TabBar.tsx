import { motion } from "framer-motion";
import { useApp, type TabKey } from "@/store/useApp";
import { cn } from "@/lib/utils";
import { Sparkles, Orbit, Heart, BookOpen, User } from "lucide-react";

const TABS: { key: TabKey; label: string; Icon: typeof Sparkles }[] = [
  { key: "heute", label: "Home", Icon: Sparkles },
  { key: "transite", label: "Transite", Icon: Orbit },
  { key: "synastrie", label: "Synastrie", Icon: Heart },
  { key: "lernen", label: "Lernen", Icon: BookOpen },
  { key: "profil", label: "Profil", Icon: User },
];

/**
 * Floating navigation: a clean glass pill at the bottom on mobile, a detached
 * glass rail on the left on desktop. The active tab is a filled cyan chip that
 * springs between tabs (framer layoutId) — modern, poppy, uncluttered.
 */
export function TabBar() {
  const tab = useApp((s) => s.tab);
  const setTab = useApp((s) => s.setTab);

  return (
    <nav
      className={cn(
        "fixed z-40 border border-white/[0.08] bg-[rgba(13,26,34,0.45)] shadow-[0_18px_50px_-14px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] [backdrop-filter:blur(28px)_saturate(130%)]",
        // mobile: floating pill above the bottom edge
        "inset-x-0 bottom-[max(env(safe-area-inset-bottom,0px),18px)] mx-auto flex h-[60px] w-[min(440px,calc(100%-24px))] items-center justify-between rounded-full px-3",
        // desktop: detached vertical glass rail, left
        "lg:inset-y-0 lg:left-5 lg:right-auto lg:bottom-auto lg:top-1/2 lg:mx-0 lg:h-auto lg:w-[80px] lg:-translate-y-1/2 lg:flex-col lg:justify-center lg:gap-2 lg:rounded-[32px] lg:px-3 lg:py-6",
      )}
    >
      {/* Genau fünf Punkte — die Brand-Marke saß hier als sechster Eintrag mit
          demselben Sparkles-Icon wie Home und las sich als zweites Home. */}
      {TABS.map(({ key, label, Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-label={label}
            title={label}
            className="group relative flex flex-1 flex-col items-center gap-1 py-1 lg:flex-none lg:px-1 lg:py-1"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full">
              {active && (
                <motion.span
                  layoutId="tab-active"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full border border-[rgba(120,150,255,0.55)] bg-[rgba(120,150,255,0.14)] shadow-[0_0_18px_-4px_rgba(120,150,255,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]"
                />
              )}
              <Icon
                className={cn(
                  "relative h-[20px] w-[20px] transition-colors duration-200",
                  active ? "text-[#8fe8f8]" : "text-[rgba(198,220,230,0.6)] group-hover:text-ink",
                )}
                strokeWidth={active ? 2.1 : 1.7}
              />
            </span>
            <span
              className={cn(
                "font-body text-[9.5px] font-medium tracking-wide transition-colors duration-200",
                active ? "text-[#97B5FF]" : "text-[rgba(198,220,230,0.55)]",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
