/**
 * Prüft die Mondphasen-Zuordnung. Auslöser: Laura wurde bei 179,2°
 * Sonne-Mond-Abstand geboren — Vollmond — und die App schrieb
 * „zunehmender Dreiviertelmond". Läuft ohne Test-Framework:
 *   node --experimental-strip-types scripts/check-mondphase.mjs
 */
import assert from "node:assert/strict";
import { PHASE_NAMEN, phaseIndex, phaseVersatz } from "../src/lib/moonPhase.ts";

const phase = (w) => PHASE_NAMEN[phaseIndex(w)];
let n = 0;
const ist = (winkel, erwartet, warum) => {
  n++;
  assert.equal(phase(winkel), erwartet, `${winkel}° sollte „${erwartet}" sein (${warum}), war „${phase(winkel)}"`);
};

// die exakten Punkte
ist(0, "Neumond", "exakt");
ist(90, "zunehmender Halbmond", "exakt");
ist(180, "Vollmond", "exakt");
ist(270, "abnehmender Halbmond", "exakt");

// knapp DAVOR zählt noch zur selben Phase — genau hier lag der Fehler
ist(179.2, "Vollmond", "Laura, vorher fälschlich Dreiviertelmond");
ist(353.9, "Neumond", "Lisa, vorher fälschlich abnehmende Sichel");
ist(88, "zunehmender Halbmond", "knapp vor dem ersten Viertel");
ist(268, "abnehmender Halbmond", "knapp vor dem letzten Viertel");

// die bereits richtigen Kunden bleiben unverändert
ist(110.5, "zunehmender Halbmond", "Max");
ist(226.5, "abnehmender Dreiviertelmond", "Darius");

// Grenzen liegen mittig zwischen zwei Phasen
ist(157.4, "zunehmender Dreiviertelmond", "Grenze");
ist(157.6, "Vollmond", "Grenze");
ist(202.4, "Vollmond", "Grenze");
ist(202.6, "abnehmender Dreiviertelmond", "Grenze");

// Nulldurchgang
ist(337.6, "Neumond", "Umschlag");
ist(337.4, "abnehmende Sichel", "Umschlag");
ist(359.9, "Neumond", "Umschlag");
ist(360, "Neumond", "Umschlag");

// Versatz zum exakten Punkt
assert.equal(phaseVersatz(179.2), -0.8, "Laura: 0,8° vor Vollmond");
assert.equal(phaseVersatz(353.9), -6.1, "Lisa: 6,1° vor Neumond");
assert.equal(phaseVersatz(226.5), null, "Dreiviertelmond hat keinen exakten Punkt");
n += 3;

console.log(`Mondphase: ${n} Prüfungen bestanden.`);
