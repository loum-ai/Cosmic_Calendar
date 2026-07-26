/**
 * layers.ts — DIE Stapelordnung der App. Eine Quelle, keine Streuzahlen.
 *
 * Warum das nötig war: die z-Werte standen als `z-[60]`, `z-[61]`, `z-[88]` …
 * über vierzehn Dateien verteilt. Burger-Menü und mobiles Sheet lagen beide
 * auf 60 — wer zuletzt gezeichnet wurde, gewann. Ergebnis: der Burger stand
 * über dem geöffneten Sheet und verdeckte dessen Schließen-Knopf, und im
 * Zeichen-Portal (ebenfalls 60) war das X gar nicht erreichbar, weil der
 * Burger exakt auf derselben Stelle oben rechts sitzt.
 *
 * Zwei Regeln, die daraus folgen:
 *   1. Was ÜBER etwas liegt, muss auch dessen Ausgang überdecken dürfen —
 *      nie umgekehrt.
 *   2. Es gibt immer genau EINEN sichtbaren Ausgang. Öffnet sich ein Sheet,
 *      verschwindet der Burger (siehe TabBar), statt mit dem X zu konkurrieren.
 *
 * Wer eine neue Ebene braucht, trägt sie HIER ein — `npm run check:layers`
 * schlägt sonst an.
 */
export const LAYER = {
  /** Frage-Leiste unten, klebt über dem Inhalt, aber unter allem Chrome. */
  composer: 41,
  /** Burger-Knopf und sein Menü. */
  chrome: 60,
  /** Vollbild-Bühnen wie das Zeichen-Portal. Über dem Burger — es bringt sein eigenes X mit. */
  portal: 65,
  /** Abdunkelung hinter dem Sheet. */
  sheetScrim: 70,
  /** Das Sheet selbst (mobil unten, auf dem Desktop als Popover). */
  sheet: 71,
  /** Erstlauf-Führung. */
  onboarding: 80,
  onboardingHint: 81,
  /** Vollbild-Detailansicht aus einem Sheet heraus. */
  detail: 88,
  /** Cockpit. */
  admin: 90,
  /** Das Ritual — bewusst über allem Normalen. */
  ritual: 92,
  /** Coach-Hinweise und Tutorial zeigen auf das, was darunter liegt. */
  coach: 95,
  /** Druckansicht, ganz oben. */
  print: 120,
} as const;

export type LayerName = keyof typeof LAYER;
