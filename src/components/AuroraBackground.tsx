/**
 * Atmosphärischer Grund — jetzt aus dem ECHTEN loum-Design-System statt aus
 * handgebauten Farbverläufen:
 *
 *   .loum-starfield  der dreilagige Parallax-Sternenhimmel (Systemregel: liegt
 *                    auf JEDEM Screen), inkl. Drift-Animation
 *   .loum-vault      der ruhige, von oben belichtete Wash — die Lesefläche
 *   .loum-aurora     der additive Hero-Wash darüber
 *
 * Diese Komponente liegt in MainApp hinter allem, greift also global: Home,
 * Transite, Lernen, Profil und die Klienten-Ansicht erben sie gleichermaßen.
 * Die Klassen kommen aus src/styles/loum/utilities.css — Original aus
 * claude.ai/design, nicht nachgebaut.
 */
export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="loum-starfield" />
      <div className="loum-vault" />
      <div className="loum-aurora" />
      {/* Vignette — Tiefe zu den Rändern, wie im Cinematic-Grade der Mocks */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_28%,transparent_42%,rgba(3,4,12,0.82)_100%)]" />
    </div>
  );
}
