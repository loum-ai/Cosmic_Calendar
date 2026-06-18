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
      <div className="vela-bloom" />

      {/* desktop / tablet: frame the 480px column so it reads as an intentional
          app panel instead of a lonely strip floating in a black void */}
      <div className="pointer-events-none fixed inset-y-0 left-1/2 -z-[1] hidden w-[480px] -translate-x-1/2 border-x border-white/[0.06] bg-white/[0.012] md:block" />

      <AnimatePresence mode="wait">
        <Screen key={tab} />
      </AnimatePresence>

      <CoachHint />
      <Composer />
      <TabBar />
      <SheetHost />
      <div className="vela-grain" />
    </div>
  );
}
