import { useApp, type TabKey } from "@/store/useApp";
import { cn } from "@/lib/utils";
import { Sparkles, Orbit, Heart, BookOpen, User } from "lucide-react";

const TABS: { key: TabKey; label: string; Icon: typeof Sparkles }[] = [
  { key: "heute", label: "Heute", Icon: Sparkles },
  { key: "transite", label: "Transite", Icon: Orbit },
  { key: "synastrie", label: "Synastrie", Icon: Heart },
  { key: "lernen", label: "Lernen", Icon: BookOpen },
  { key: "profil", label: "Profil", Icon: User },
];

/**
 * Adaptive navigation: a frosted bottom tab bar on mobile, a real vertical
 * sidebar (logo + labelled items) on desktop.
 */
export function TabBar() {
  const tab = useApp((s) => s.tab);
  const setTab = useApp((s) => s.setTab);

  return (
    <nav
      className={cn(
        "fixed z-40 bg-[rgba(10,10,20,0.85)] backdrop-blur-[24px]",
        // mobile: bottom bar
        "inset-x-0 bottom-0 mx-auto flex h-[68px] max-w-[480px] items-start justify-around border-t border-line px-6 pt-4",
        // desktop: left sidebar
        "lg:inset-y-0 lg:left-0 lg:right-auto lg:mx-0 lg:h-full lg:w-[240px] lg:max-w-none lg:flex-col lg:items-stretch lg:justify-start lg:gap-1.5 lg:border-r lg:border-t-0 lg:px-4 lg:pt-9",
      )}
    >
      {/* brand — desktop only */}
      <div className="hidden lg:mb-6 lg:flex lg:items-center lg:gap-2.5 lg:px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cta-gradient text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="vela-wordmark text-[15px]">VELA</span>
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
              "flex flex-1 flex-col items-center gap-2 pt-0.5 transition-colors duration-300",
              "lg:flex-none lg:flex-row lg:items-center lg:justify-start lg:gap-3 lg:rounded-xl lg:px-3 lg:py-2.5",
              active
                ? "text-violet [filter:drop-shadow(0_0_6px_rgba(139,92,246,0.5))] lg:bg-surface lg:[filter:none]"
                : "text-[rgba(200,192,228,0.45)] lg:hover:bg-surface",
            )}
          >
            <Icon className="h-[21px] w-[21px]" strokeWidth={1.6} />
            <span className="hidden font-body text-sm font-medium lg:inline">{label}</span>
            <span
              className={cn(
                "h-1 w-1 rounded-full transition-all duration-300 lg:hidden",
                active ? "bg-violet shadow-[0_0_6px_rgba(139,92,246,0.8)]" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
