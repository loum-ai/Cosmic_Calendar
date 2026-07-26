/**
 * factAnswers.ts — Fragen, die eine Rechnung sind, werden gerechnet.
 *
 * Anlass (Laura, 2026-07-26): auf „Wie lange hält dieser Transit?" kam ein
 * Text über ihre Sonne. Die Frage war nie eine Deutungsfrage — die Antwort
 * steht in der Ephemeride. Ein Sprachmodell kann sie bestenfalls raten.
 *
 * Regel dahinter: Was berechenbar ist, wird berechnet und mit Datum belegt.
 * Gedeutet wird nur, was tatsächlich Deutung braucht. Trifft hier keine
 * Regel zu, gibt die Funktion null zurück und die normale Deutung übernimmt —
 * sie rät nie an der Frage vorbei.
 */
import { CHART } from "./data";
import { computeTransits, transitWindow, MAX_TAGE } from "./transits";

const TAG = (d: Date) =>
  d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });

/** Zeitfragen: „wie lange", „bis wann", „wann vorbei", „wann exakt", „wann endet". */
const ZEITFRAGE = /(wie lange|wie lang\b|bis wann|wann (ist|wird).{0,20}(vorbei|exakt|genau)|wann endet|wann hört|wie viele tage|noch an)/i;
/** … und es muss um einen Transit gehen, nicht um das Geburtsbild. */
const TRANSITFRAGE = /(transit|läuft gerade|gerade jetzt|aktuell|im moment|zurzeit|dieser|diese phase)/i;

/** Namen der laufenden Planeten, damit „wie lange hält der Saturn" den richtigen trifft. */
const PLANETEN: Record<string, string> = {
  sonne: "sun", mond: "moon", merkur: "mercury", venus: "venus", mars: "mars",
  jupiter: "jupiter", saturn: "saturn", uranus: "uranus", neptun: "neptune", pluto: "pluto",
};

/**
 * Antwortet auf Zeitfragen zu laufenden Transiten — mit echten Daten.
 * Gibt null zurück, wenn die Frage keine ist, die sich rechnen lässt.
 */
export function faktenAntwort(frage: string, jetzt: Date = new Date()): string | null {
  if (!ZEITFRAGE.test(frage) || !TRANSITFRAGE.test(frage)) return null;

  const hits = computeTransits(CHART, jetzt);
  if (!hits.length) return "Gerade berührt kein laufender Planet einen Punkt in deinem Bild eng genug, um von einem Transit zu sprechen.";

  // Nennt die Frage einen Planeten, ist der gemeint — sonst der stärkste.
  const q = frage.toLowerCase();
  const genannt = Object.entries(PLANETEN).find(([wort]) => q.includes(wort))?.[1];
  const hit = (genannt && hits.find((h) => h.tKey === genannt)) || hits[0];

  const natal = CHART.find((p) => p.key === hit.nKey);
  if (!natal) return null;

  const w = transitWindow(natal.lon, hit.tKey, hit.type, jetzt);
  if (!w) return null;

  const restTage = Math.max(0, Math.round((w.bis.getTime() - jetzt.getTime()) / 86400000));
  const teile: string[] = [];

  const MONATE = Math.round(MAX_TAGE / 30);

  teile.push(
    w.offenVorn
      ? `${hit.title} läuft schon länger als die geprüften ${MONATE} Monate.`
      : `${hit.title} läuft seit dem ${TAG(w.von)}.`,
  );

  if (w.offenHinten) {
    teile.push(`Er hält noch mindestens ${MONATE} Monate an — bei den langsamen Planeten ist das normal.`);
  } else {
    teile.push(
      restTage === 0
        ? "Heute ist der letzte Tag im Orbis."
        : `Er hält noch ${restTage} ${restTage === 1 ? "Tag" : "Tage"}, bis zum ${TAG(w.bis)}.`,
    );
  }

  if (w.exakt) {
    const diff = Math.round((w.exakt.getTime() - jetzt.getTime()) / 86400000);
    teile.push(
      diff === 0
        ? "Heute steht er exakt."
        : diff > 0
          ? `Exakt wird er am ${TAG(w.exakt)}, in ${diff} ${diff === 1 ? "Tag" : "Tagen"}.`
          : `Exakt stand er am ${TAG(w.exakt)}, vor ${-diff} ${-diff === 1 ? "Tag" : "Tagen"}.`,
    );
  } else {
    // Kein einzelnes Datum: langsame Planeten laufen durch die Rückläufigkeit
    // oft dreimal exakt über denselben Punkt. Eine Zahl wäre hier gelogen.
    teile.push("Einen einzelnen exakten Tag gibt es hier nicht — langsame Planeten laufen durch ihre Rückläufigkeit meist mehrfach über denselben Punkt.");
  }

  teile.push(`Gerechnet aus den Planetenständen, nicht gedeutet — Orbis aktuell ${hit.orb}°.`);
  return teile.join(" ");
}
