import { motion } from "framer-motion";
import { useApp, type TabKey } from "@/store/useApp";
import { cn } from "@/lib/utils";
import { Sparkles, Orbit, Heart, BookOpen, User } from "lucide-react";

const TABS: { key: TabKey; label: string; Icon: typeof Sparkles }[] = [
  { key: "heute", label: "Chart", Icon: Sparkles },
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
        "fixed z-40 border border-white/10 bg-[rgba(11,22,29,0.72)] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl",
        // mobile: floating pill above the bottom edge
        "inset-x-0 bottom-[max(env(safe-area-inset-bottom,0px),16px)] mx-auto flex h-[68px] w-[min(430px,calc(100%-24px))] items-center justify-around rounded-[26px] px-2.5",
        // desktop: detached vertical glass rail, left
        "lg:inset-y-0 lg:left-5 lg:right-auto lg:bottom-auto lg:top-1/2 lg:mx-0 lg:h-auto lg:w-[84px] lg:-translate-y-1/2 lg:flex-col lg:justify-center lg:gap-1.5 lg:rounded-[30px] lg:px-3 lg:py-6",
      )}
    >
      {/* brand mark — desktop only */}
      <div className="hidden lg:mb-3 lg:flex lg:h-11 lg:w-11 lg:items-center lg:justify-center lg:rounded-2xl lg:bg-cta-gradient lg:text-[#052029] lg:shadow-glow">
        <Sparkles className="h-5 w-5" strokeWidth={2.2} />
      </div>

      {TABS.map(({ key, label, Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-label={label}
            title={label}
            className="group relative flex flex-1 flex-col items-center gap-1.5 py-1.5 lg:flex-none lg:px-1 lg:py-1.5"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl">
              {active && (
                <motion.span
                  layoutId="tab-active"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-2xl bg-cta-gradient shadow-[0_0_22px_-4px_rgba(79,214,239,0.75)]"
                />
              )}
              <Icon
                className={cn(
                  "relative h-[21px] w-[21px] transition-colors duration-200",
                  active ? "text-[#052029]" : "text-[rgba(198,220,230,0.66)] group-hover:text-ink",
                )}
                strokeWidth={active ? 2.3 : 1.8}
              />
            </span>
            <span
              className={cn(
                "font-body text-[10px] font-medium tracking-wide transition-colors duration-200",
                active ? "text-[#8fe4f5]" : "text-[rgba(198,220,230,0.6)]",
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
