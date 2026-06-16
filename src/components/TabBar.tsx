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
 * Bottom tab bar — 74px, frosted, line icons. Active tab lifts + glows.
 * Styling matches the prototype exactly.
 */
export function TabBar() {
  const tab = useApp((s) => s.tab);
  const setTab = useApp((s) => s.setTab);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[74px] max-w-[480px] items-start justify-around border-t border-white/[0.07] bg-[rgba(5,5,10,0.86)] px-6 pt-3.5 backdrop-blur-xl">
      {TABS.map(({ key, label, Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 pt-0.5 transition-all duration-300",
              active ? "text-ink-soft -translate-y-0.5 scale-105" : "text-[rgba(200,192,228,0.34)]",
            )}
          >
            <Icon
              className="h-[22px] w-[22px]"
              strokeWidth={1.6}
              style={active ? { filter: "drop-shadow(0 0 7px rgba(180,150,250,0.7))" } : undefined}
            />
            <span className="text-[7.5px] font-medium uppercase tracking-[0.04em]">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
