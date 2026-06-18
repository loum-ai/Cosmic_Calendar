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
    <div className="relative min-h-dvh w-full overflow-x-hidden text-ink lg:flex lg:items-center lg:justify-center lg:py-10">
      <AuroraBackground />
      <div className="vela-bloom" />

      {/* On desktop, present the mobile app as a premium device frame floating
          in deep space instead of a thin strip. The transform makes the fixed
          bars (composer / tab bar) resolve against the frame, and the scroll
          lives inside it. On mobile this div is a no-op pass-through. */}
      <div className="relative w-full lg:h-[min(900px,calc(100dvh-5rem))] lg:w-[430px] lg:overflow-y-auto lg:rounded-[46px] lg:border lg:border-white/[0.12] lg:shadow-[0_50px_140px_-40px_rgba(0,0,0,0.95)] lg:[transform:translateZ(0)]">
        <AnimatePresence mode="wait">
          <Screen key={tab} />
        </AnimatePresence>

        <CoachHint />
        <Composer />
        <TabBar />
        <SheetHost />
        <div className="vela-grain" />
      </div>
    </div>
  );
}
