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
 * Floating navigation: a detached glass pill at the bottom on mobile, and a
 * detached, rounded glass rail on the left on desktop.
 */
export function TabBar() {
  const tab = useApp((s) => s.tab);
  const setTab = useApp((s) => s.setTab);

  return (
    <nav
      className={cn(
        "fixed z-40 border border-[rgba(185,168,255,0.14)] bg-[rgba(14,12,28,0.72)] shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl",
        // mobile: floating pill above the bottom edge
        "inset-x-0 bottom-[max(env(safe-area-inset-bottom,0px),16px)] mx-auto flex h-[64px] w-[min(420px,calc(100%-28px))] items-center justify-around rounded-pill px-4",
        // desktop: detached vertical glass rail, left
        "lg:inset-y-0 lg:left-5 lg:right-auto lg:bottom-auto lg:top-1/2 lg:mx-0 lg:h-auto lg:w-[80px] lg:-translate-y-1/2 lg:flex-col lg:justify-center lg:gap-1 lg:rounded-[28px] lg:px-3 lg:py-5",
      )}
    >
      {/* brand mark — desktop only */}
      <div className="hidden lg:mb-3 lg:flex lg:h-11 lg:w-11 lg:items-center lg:justify-center lg:rounded-2xl lg:bg-cta-gradient lg:text-white lg:shadow-glow">
        <Sparkles className="h-5 w-5" />
      </div>

      {TABS.map(({ key, label, Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-label={label}
            title={label}
            className={cn(
              "group relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors duration-300",
              "lg:flex-none lg:gap-1 lg:px-1 lg:py-2.5",
              active ? "text-lilac" : "text-[rgba(200,192,228,0.5)] hover:text-ink",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-2xl transition-all duration-300",
                active ? "bg-surface-2 shadow-[inset_0_0_0_1px_rgba(185,168,255,0.3)] [filter:drop-shadow(0_0_6px_rgba(139,92,246,0.5))]" : "group-hover:bg-surface",
              )}
            >
              <Icon className="h-[20px] w-[20px]" strokeWidth={1.7} />
            </span>
            <span className="font-body text-[10px] font-medium tracking-wide">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
