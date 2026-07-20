import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { IS_DEMO } from "@/lib/data";
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
import { ThemenHub } from "@/screens/ThemenHub";
import { TransiteScreen } from "@/screens/TransiteScreen";
import { SynastrieScreen } from "@/screens/SynastrieScreen";
import { LernenScreen } from "@/screens/LernenScreen";
import { ProfilScreen } from "@/screens/ProfilScreen";

/** Heute tab: the calm Themen-Hub is the home; the full chart is one tap away. */
function HeuteHome() {
  const homeView = useApp((s) => s.homeView);
  return homeView === "hub" ? <ThemenHub /> : <ChartExplorer />;
}

const SCREENS = {
  heute: HeuteHome,
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
  const refreshInterpretation = useApp((s) => s.refreshInterpretation);
  const aiReady = useApp((s) => s.aiReady);
  const aiLoading = useApp((s) => s.aiLoading);
  const bumpChart = useApp((s) => s.bumpChart);
  const Screen = SCREENS[tab];

  // Demo: load the REAL Gemini interpretation so the sample shows specific,
  // generated readings (not the bundled placeholders). Client links already
  // carry their published interpretation.
  useEffect(() => {
    if (IS_DEMO && !viewer && !aiReady && !aiLoading) {
      refreshInterpretation().then(() => bumpChart());
    }
  }, [viewer, aiReady, aiLoading, refreshInterpretation, bumpChart]);

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
