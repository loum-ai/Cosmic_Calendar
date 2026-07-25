/**
 * Mondphase bei der Geburt — aus dem Winkel Mond minus Sonne.
 *
 * Bewusst ohne jede Abhängigkeit, damit `scripts/check-mondphase.mjs` die
 * Funktion direkt prüfen kann, ohne die halbe App zu laden.
 *
 * FEHLER BIS 2026-07: Der Index kam aus `floor(winkel / 45)`. Damit BEGANN
 * jede Phase an ihrem exakten Punkt — „Vollmond" lief von 180° bis 225°. Das
 * ist die astrologische Einteilung nach Rudhyar, widerspricht aber jedem
 * Mondkalender und jedem Blick zum Himmel: Wer bei 179° geboren ist, kam bei
 * Vollmond zur Welt, nicht bei „zunehmendem Dreiviertelmond".
 *
 * Gemessen an den echten Kundendaten war das bei der Hälfte falsch:
 *   Laura 179,2° → stand „zunehmender Dreiviertelmond", richtig ist Vollmond
 *   Lisa  353,9° → stand „abnehmende Sichel", richtig ist Neumond
 *   Max   110,5° und Darius 226,5° lagen zufällig richtig (Phasenmitte)
 *
 * Jetzt liegt der exakte Punkt in der MITTE seiner Phase (Vollmond
 * 157,5°–202,5°) — das deckt sich mit dem, was am Himmel zu sehen war.
 */
const VERSATZ = 22.5;

export const PHASE_NAMEN = [
  "Neumond",
  "zunehmende Sichel",
  "zunehmender Halbmond",
  "zunehmender Dreiviertelmond",
  "Vollmond",
  "abnehmender Dreiviertelmond",
  "abnehmender Halbmond",
  "abnehmende Sichel",
] as const;

/** 0–7, passend zu PHASE_NAMEN. */
export function phaseIndex(winkel: number): number {
  const w = (((winkel + VERSATZ) % 360) + 360) % 360;
  return Math.floor(w / 45) % 8;
}

/**
 * Abstand zum exakten Punkt der Phase: negativ = davor, positiv = danach.
 * Nur Neumond, die beiden Halbmonde und Vollmond HABEN einen exakten Punkt
 * (0°/90°/180°/270°) — bei den Dreiviertel-Phasen ist die Angabe sinnlos und
 * kommt als `null` zurück.
 */
export function phaseVersatz(winkel: number): number | null {
  const i = phaseIndex(winkel);
  if (i % 2 !== 0) return null;
  const d = (((winkel - i * 45 + 180) % 360) + 360) % 360 - 180;
  return Math.round(d * 10) / 10;
}
