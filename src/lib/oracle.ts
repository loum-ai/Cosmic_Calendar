/**
 * Local "oracle" — a grounded, offline fallback for "Frag dein Horoskop".
 * On a static deploy (GitHub Pages) there is no /api backend, so instead of
 * apologising we answer locally from the chart data. Clearly flagged as a
 * demo in the UI. When a real backend IS present, the live answer wins.
 */
import { CHART, PINFO, computeAspects, signName } from "./data";

const byKey = (key: string) => CHART.find((p) => p.key === key);

function answerFor(key: string): string {
  const p = byKey(key);
  const info = PINFO[key];
  if (!p || !info) return answerFor("sun");
  return `${info.what} Bei dir steht ${p.name} in ${signName(p.lon)}: ${p.txt}`;
}

/** Deterministic, chart-grounded answer for the offline/demo Q&A. */
export function localOracle(question: string): string {
  const q = question.toLowerCase();

  if (/(lieb|beziehung|herz|partner|verlieb)/.test(q)) return answerFor("venus");
  if (/(kraft|energie|stark|durchsetz|antrieb|mut|wut)/.test(q)) return answerFor("mars");
  if (/(denk|kopf|lern|versteh|rede|sprech|kommunik)/.test(q)) return answerFor("mercury");
  if (/(gefühl|fühl|emotion|geborgen|sicher|innen)/.test(q)) return answerFor("moon");
  if (/(wachs|sinn|größt|weit|horizont|glück|reise|chance)/.test(q)) return answerFor("jupiter");
  if (/(diszipl|struktur|grenz|reif|stabil|pflicht)/.test(q)) return answerFor("saturn");

  if (/(talent|gabe|stärke|leicht|kann ich gut)/.test(q)) {
    const tri = computeAspects().find((a) => a.def.type === "Trigon");
    if (tri) {
      return `Dein eingebautes Talent: ${tri.A.name} und ${tri.B.name} fließen mühelos zusammen (${tri.def.type}). ${tri.A.txt}`;
    }
    return answerFor("sun");
  }

  // "Was macht mich aus?", "Mein Thema?", default → the core self.
  return answerFor("sun");
}
