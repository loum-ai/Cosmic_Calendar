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
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[68px] max-w-[480px] items-start justify-around border-t border-white/[0.06] bg-[rgba(6,5,12,0.82)] px-6 pt-4 backdrop-blur-2xl">
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
              active ? "text-ink-soft" : "text-[rgba(200,192,228,0.32)]",
            )}
          >
            <Icon className="h-[21px] w-[21px]" strokeWidth={1.6} />
            {/* quiet active dot instead of loud labels + glow (prototype restraint) */}
            <span
              className={cn(
                "h-1 w-1 rounded-full transition-all duration-300",
                active ? "bg-lilac shadow-[0_0_6px_rgba(180,150,250,0.8)]" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
