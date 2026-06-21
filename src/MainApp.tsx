import { AnimatePresence } from "framer-motion";
import { AuroraBackground } from "@/components/AuroraBackground";
import { TabBar } from "@/components/TabBar";
import { Composer } from "@/components/Composer";
import { SheetHost } from "@/components/SheetHost";
import { DetailView } from "@/components/DetailView";
import { CoachHint } from "@/components/CoachHint";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { Onboarding } from "@/components/Onboarding";
import { PrintFlow } from "@/components/PrintFlow";
import { useApp } from "@/store/useApp";
import { ChartExplorer } from "@/screens/ChartExplorer";
import { TransiteScreen } from "@/screens/TransiteScreen";
import { SynastrieScreen } from "@/screens/SynastrieScreen";
import { LernenScreen } from "@/screens/LernenScreen";
import { ProfilScreen } from "@/screens/ProfilScreen";

const SCREENS = {
  heute: ChartExplorer,
  transite: TransiteScreen,
  synastrie: SynastrieScreen,
  lernen: LernenScreen,
  profil: ProfilScreen,
} as const;

/** The tab application. Shared by the public demo and the client-link view. */
export function MainApp() {
  const tab = useApp((s) => s.tab);
  const chartVersion = useApp((s) => s.chartVersion);
  const viewer = useApp((s) => s.viewerMode);
  const printOpen = useApp((s) => s.printOpen);
  const Screen = SCREENS[tab];

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden text-ink">
      <AuroraBackground />

      <div className="lg:pl-[120px]">
        <AnimatePresence mode="wait">
          <Screen key={`${tab}-${chartVersion}`} />
        </AnimatePresence>
      </div>

      <CoachHint />
      <Composer />
      <TabBar />
      <SheetHost />
      <DetailView />
      {!viewer && <Onboarding />}
      <TutorialOverlay />
      {printOpen && <PrintFlow />}
      <div className="vela-grain" />
    </div>
  );
}
