import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AuroraBackground } from "@/components/AuroraBackground";
import { TabBar } from "@/components/TabBar";
import { Composer } from "@/components/Composer";
import { SheetHost } from "@/components/SheetHost";
import { DetailView } from "@/components/DetailView";
import { CoachHint } from "@/components/CoachHint";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { Onboarding } from "@/components/Onboarding";
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
  const chartVersion = useApp((s) => s.chartVersion);
  const refreshInterpretation = useApp((s) => s.refreshInterpretation);
  const Screen = SCREENS[tab];

  // Fetch the real AI interpretation for the active chart once on load.
  useEffect(() => {
    refreshInterpretation();
  }, [refreshInterpretation]);

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden text-ink">
      <AuroraBackground />

      {/* content is offset by the desktop sidebar; full-bleed on mobile */}
      <div className="lg:pl-[240px]">
        <AnimatePresence mode="wait">
          <Screen key={`${tab}-${chartVersion}`} />
        </AnimatePresence>
      </div>

      <CoachHint />
      <Composer />
      <TabBar />
      <SheetHost />
      <DetailView />
      <Onboarding />
      <TutorialOverlay />
      <div className="vela-grain" />
    </div>
  );
}
