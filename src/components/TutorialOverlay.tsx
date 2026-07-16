import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useApp, type TabKey } from "@/store/useApp";
import { EASE } from "@/lib/tokens";

interface Slide {
  eyebrow: string;
  title: string;
  body: string;
  glyph: string;
}

/**
 * First-visit, full-bleed tutorial carousel — one per screen. Purely
 * typographic with a large zodiac/glyph graphic, explaining what the user
 * sees here and why it matters. Shown once per screen (persisted).
 */
const TUTORIALS: Record<TabKey, Slide[]> = {
  heute: [
    { eyebrow: "HEUTE", title: "Was heute am Himmel steht", body: "Die exakte Tageslage deiner Planeten — übersetzt in eine klare, brauchbare Deutung. Kein Eso-Schaum.", glyph: "✦" },
    { eyebrow: "DEIN GEBURTSRAD", title: "Der Himmel im Moment deiner Geburt", body: "Jeder Punkt auf Grad genau. Tippe ihn an — die Bedeutung kommt in Klartext.", glyph: "☉" },
    { eyebrow: "GROSSE DREI", title: "Sonne, Mond, Aszendent", body: "Dein Wesen, dein Gefühl, deine Wirkung — die drei Koordinaten, mit denen alles anfängt.", glyph: "☽" },
  ],
  transite: [
    { eyebrow: "Transite", title: "Was der Himmel heute auslöst", body: "Die Planeten bewegen sich weiter — und berühren dein Geburtsbild. Hier siehst du, was das gerade für dich bedeutet.", glyph: "♃" },
    { eyebrow: "Stärkster Einfluss", title: "Worauf es heute ankommt", body: "Der wichtigste Transit zuerst, mit der ganzen Geschichte dahinter. Plus das größere kosmische Wetter.", glyph: "♄" },
  ],
  synastrie: [
    { eyebrow: "Synastrie", title: "Wie ihr zusammenklingt", body: "Vergleiche dein Chart mit dem eines anderen Menschen — Partner, Familie, Freund oder Kollegin.", glyph: "♀" },
    { eyebrow: "Resonanz", title: "Wo ihr euch anzieht — und reibt", body: "Sieh die stärksten Berührungspunkte zwischen euren Charts, verständlich erklärt.", glyph: "☍" },
  ],
  lernen: [
    { eyebrow: "Wissen", title: "Die Bausteine des Himmels", body: "Planeten, Zeichen, Häuser und Verbindungen — verständlich erklärt, in deinem Tempo.", glyph: "△" },
    { eyebrow: "Konzept des Tages", title: "Jeden Tag etwas Neues verstehen", body: "Ein kleiner astrologischer Baustein pro Tag. So wächst dein Verständnis ganz nebenbei.", glyph: "✶" },
  ],
  profil: [
    { eyebrow: "Dein Profil", title: "Deine Daten, dein Chart", body: "Geburtsdatum, -zeit und -ort bestimmen dein ganzes Bild. Hier hast du alles auf einen Blick.", glyph: "⚸" },
  ],
};

export function TutorialOverlay() {
  const tab = useApp((s) => s.tab);
  const seen = useApp((s) => s.seenTut[tab]);
  const mark = useApp((s) => s.markTutSeen);
  const composerOpen = useApp((s) => s.composerOpen);
  const [i, setI] = useState(0);

  useEffect(() => setI(0), [tab]);

  const slides = TUTORIALS[tab];
  const open = !seen && !composerOpen && slides && slides.length > 0;
  if (!open) return null;

  const slide = slides[i];
  const last = i === slides.length - 1;
  const next = () => (last ? mark(tab) : setI((v) => v + 1));

  return (
    <AnimatePresence>
      <motion.div
        key="tut"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[95] flex flex-col bg-[#0d0d0d]"
      >
        {/* deep-space backdrop — one tight, restrained glow, no haze */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_48%_28%_at_50%_-6%,rgba(116,96,200,0.12),transparent_55%)]" />
        {/* huge glyph watermark */}
        <AnimatePresence mode="wait">
          <motion.span
            key={"g" + i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.08, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.45, ease: EASE.smooth }}
            className="vela-glyph pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[min(70vw,460px)] leading-none text-white"
          >
            {slide.glyph}
          </motion.span>
        </AnimatePresence>

        {/* skip */}
        <button
          onClick={() => mark(tab)}
          className="absolute right-5 top-[max(20px,env(safe-area-inset-top))] z-10 flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3.5 py-2 font-body text-xs text-txt-2 backdrop-blur-md active:scale-95"
        >
          Überspringen <X className="h-3.5 w-3.5" />
        </button>

        {/* slide content */}
        <div className="relative z-10 mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
              transition={{ duration: 0.4, ease: EASE.smooth }}
            >
              <div className="vela-label !text-xs">{slide.eyebrow}</div>
              <h1 className="mt-4 font-display text-[clamp(30px,7vw,46px)] font-extrabold leading-[1.05] tracking-[-0.02em] text-txt">
                {slide.title}
              </h1>
              <p className="mt-5 max-w-[44ch] font-body text-[15px] leading-relaxed text-txt-2">{slide.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* footer: progress dots + CTA */}
        <div className="relative z-10 mx-auto flex w-full max-w-[640px] items-center justify-between px-8 pb-[max(28px,env(safe-area-inset-bottom))]">
          <div className="flex gap-1.5">
            {slides.map((_, di) => (
              <span
                key={di}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: di === i ? 22 : 6, background: di === i ? "#4fd6ef" : "rgba(255,255,255,0.22)" }}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="flex items-center gap-2 rounded-pill bg-cta-gradient px-6 py-3 font-display text-sm font-semibold text-white shadow-glow active:scale-95"
          >
            {last ? "Los geht's" : "Weiter"}
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
