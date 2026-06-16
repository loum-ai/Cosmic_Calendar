import { AnimatePresence } from "framer-motion";
import { AuroraBackground } from "@/components/AuroraBackground";
import { TabBar } from "@/components/TabBar";
import { Composer } from "@/components/Composer";
import { SheetHost } from "@/components/SheetHost";
import { CoachHint } from "@/components/CoachHint";
import { useApp } from "@/store/useApp";
import { HeuteScreen } from "@/screens/HeuteScreen";
import { TransiteScreen } from "@/screens/TransiteScreen";
import { SynastrieScreen } from "@/screens/SynastrieScreen";
import { LernenScreen } from "@/screens/LernenScreen";
import { ProfilScreen } from "@/screens/ProfilScreen";

const SCREENS = {
  heute: HeuteScreen,
  transite: TransiteScreen,
  synastrie: SynastrieScreen,
  lernen: LernenScreen,
  profil: ProfilScreen,
} as const;

export default function App() {
  const tab = useApp((s) => s.tab);
  const Screen = SCREENS[tab];

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden text-ink">
      <AuroraBackground />

      {/* faux status bar — matches the prototype */}
      <div className="fixed inset-x-0 top-0 z-40 mx-auto flex h-[50px] max-w-[480px] items-center justify-between px-7 pt-4 text-xs font-medium text-ink-soft/80">
        <span>9:41</span>
        <span className="h-[9px] w-[17px] rounded-sm border border-ink-soft/50" />
      </div>

      <AnimatePresence mode="wait">
        <Screen key={tab} />
      </AnimatePresence>

      <CoachHint />
      <Composer />
      <TabBar />
      <SheetHost />
    </div>
  );
}
