import { CHART, HOUSE, NODES, THEME, signName, houseOf, computeAspects } from "./data";
import { chartPatterns } from "./patterns";
import type { TabKey } from "@/store/useApp";

/**
 * Vorschlagsfragen für den Chat — aus DIESEM Geburtsbild abgeleitet, nicht aus
 * einer festen Liste.
 *
 * Vorher standen in `Composer.tsx` fünf feste Dreiergruppen („Was macht mich
 * aus?", „Wie liebe ich?"), identisch für jeden Kunden. Das ist genau die
 * Sorte Startzustand, die niemanden ins Gespräch bringt: ein leeres Feld mit
 * Fragen, die man auch ohne Horoskop stellen könnte.
 *
 * Jede Frage trägt ihre Herkunft mit (`from`) — die Stellung, aus der sie
 * folgt. Die Oberfläche kann sie darunter zeigen, und der Auftrag an Vela wird
 * dadurch präziser.
 */
export interface AskSuggestion {
  /** die Frage, wie ein Mensch sie stellen würde */
  q: string;
  /** woraus sie folgt — „Sonne Quadrat Mars (1,3°)" */
  from: string;
}

/** „Dein Wesenskern" → „mein Wesenskern" */
const mein = (s: string) => s.replace(/^Deine\b/, "meine").replace(/^Dein\b/, "mein");
const themeOf = (k: string, fallback: string) => mein(THEME[k] ?? fallback);

/** Frageform je nach Art der Verbindung. */
function aspectQuestion(typ: string, a: string, b: string): string {
  if (typ === "Quadrat" || typ === "Opposition") return `Warum ziehen ${a} und ${b} bei mir in verschiedene Richtungen?`;
  if (typ === "Konjunktion") return `Was heißt es, dass ${a} und ${b} bei mir wie eine Kraft wirken?`;
  return `Wie nutze ich, dass ${a} und ${b} bei mir mühelos zusammenspielen?`;
}

/** Alle Kandidaten aus dem Chart, in absteigender Aussagekraft. */
export function allSuggestions(): AskSuggestion[] {
  const out: AskSuggestion[] = [];
  const p = (k: string) => CHART.find((x) => x.key === k);
  const houseOfP = (x: { house?: number | null; lon: number }) => x.house ?? houseOf(x.lon);

  // 1 · die beiden engsten Verbindungen — das Prägendste am Bild
  const asp = [...computeAspects()].sort((x, y) => x.orb - y.orb).slice(0, 2);
  for (const a of asp) {
    out.push({
      q: aspectQuestion(a.def.type, themeOf(a.A.key, a.A.name), themeOf(a.B.key, a.B.name)),
      from: `${a.A.name} ${a.def.type} ${a.B.name} (${a.orb.toFixed(1)}°)`,
    });
  }

  // 2 · der Mond — wo dieser Mensch zur Ruhe kommt
  const moon = p("moon");
  if (moon) {
    const h = houseOfP(moon);
    out.push({
      q: `Warum finde ich ausgerechnet über ${HOUSE[h - 1]} zur Ruhe?`,
      from: `Mond in ${signName(moon.lon)}, ${h}. Haus`,
    });
  }

  // 3 · Saturn — wo es zäh ist und lange dauert
  const saturn = p("saturn");
  if (saturn) {
    const h = houseOfP(saturn);
    out.push({
      q: `Warum fällt mir ${HOUSE[h - 1]} schwerer als anderen?`,
      from: `Saturn in ${signName(saturn.lon)}, ${h}. Haus`,
    });
  }

  // 4 · das auffälligste Muster des ganzen Bildes
  const pat = chartPatterns()[0];
  if (pat) out.push({ q: `„${pat.human}" — was heißt das in meinem Alltag?`, from: `${pat.title}: ${pat.text}` });

  // 5 · rückläufige Planeten — nur wenn es welche gibt
  const retro = CHART.filter((x) => x.retro);
  if (retro.length) {
    out.push({
      q: retro.length === 1
        ? `Was bedeutet es, dass ${retro[0].name} bei mir rückläufig ist?`
        : `Was bedeutet es, dass ${retro.length} meiner Planeten rückläufig sind?`,
      from: `rückläufig: ${retro.map((x) => x.name).join(", ")}`,
    });
  }

  // 6 · die Mondknoten — Richtung und Loslassen
  const nn = NODES.find((n) => n.key === "node_n");
  if (nn) {
    out.push({
      q: `Wohin entwickle ich mich gerade — und was darf ich dabei loslassen?`,
      from: `aufsteigender Mondknoten in ${signName(nn.lon)}${nn.house ? `, ${nn.house}. Haus` : ""}`,
    });
  }

  // 7 · Venus und Mars — Nähe und Reibung
  const venus = p("venus");
  if (venus) {
    const h = houseOfP(venus);
    out.push({
      q: `Was brauche ich in einer Beziehung wirklich?`,
      from: `Venus in ${signName(venus.lon)}, ${h}. Haus`,
    });
  }

  // 8 · die Sonne — Kern und Beruf
  const sun = p("sun");
  if (sun) {
    const h = houseOfP(sun);
    out.push({
      q: `Wo komme ich am meisten zu mir selbst?`,
      from: `Sonne in ${signName(sun.lon)}, ${h}. Haus`,
    });
  }

  return out;
}

/** Fragen zum Lernen-Bereich sind bewusst allgemein — dort ist das Lexikon. */
const LERNEN: AskSuggestion[] = [
  { q: "Was ist ein Aspekt?", from: "Grundlagen" },
  { q: "Wofür stehen die zwölf Häuser?", from: "Grundlagen" },
  { q: "Was sind die Mondknoten?", from: "Grundlagen" },
];

/**
 * Die Vorschläge für einen Screen. Der laufende Himmel bekommt eigene Fragen,
 * das Lexikon behält seine allgemeinen — überall sonst kommen sie aus dem Chart.
 */
export function askSuggestions(tab: TabKey, limit = 3): AskSuggestion[] {
  if (tab === "lernen") return LERNEN;
  const alle = allSuggestions();
  if (tab === "transite") {
    return [
      { q: "Was löst der laufende Himmel gerade bei mir aus?", from: "aktuelle Transite" },
      ...alle.slice(0, limit - 1),
    ];
  }
  if (tab === "synastrie") {
    return [
      { q: "Worauf stoße ich in Beziehungen immer wieder?", from: "Venus, Mars und das 7. Haus" },
      ...alle.slice(0, limit - 1),
    ];
  }
  return alle.slice(0, limit);
}

/** Anschlussfragen nach einer Antwort — dieselbe Quelle, nur nicht die schon
 *  gestellte. Hält das Gespräch in Bewegung, ohne dass man sich selbst etwas
 *  ausdenken muss. */
export function followUps(gestellt: string, limit = 2): AskSuggestion[] {
  return allSuggestions().filter((s) => s.q !== gestellt).slice(0, limit);
}

/**
 * BELEGE (Plan-Schritt C3) — worauf sich eine Antwort stützt.
 *
 * Das ist der Punkt, an dem Vela The Pattern schlagen kann: dort ist die
 * Astrologie komplett versteckt, hier lässt sie sich aufklappen. Bei den
 * Vorschlagsfragen steht die Herkunft fest; bei frei getippten Fragen wird sie
 * aus der Antwort gelesen — welche Planeten, Zeichen und Häuser wirklich
 * vorkommen. Nur was IM Text steht, wird auch angezeigt: kein Beleg, den die
 * Deutung gar nicht verwendet hat.
 */
export interface Beleg {
  label: string;
  sheet: { kind: "planet" | "house" | "sign"; key: string | number };
}

export function belege(antwort: string, limit = 4): Beleg[] {
  if (!antwort) return [];
  const out: Beleg[] = [];
  const gesehen = new Set<string>();
  const push = (label: string, sheet: Beleg["sheet"]) => {
    const k = `${sheet.kind}:${sheet.key}`;
    if (gesehen.has(k)) return;
    gesehen.add(k);
    out.push({ label, sheet });
  };

  // Planeten und Punkte: nur die, die dieses Chart wirklich hat
  for (const p of CHART) {
    if (!new RegExp(`\\b${p.name}\\b`).test(antwort)) continue;
    const h = p.house ?? houseOf(p.lon);
    push(`${p.name} in ${signName(p.lon)}, ${h}. Haus`, { kind: "planet", key: p.key });
  }
  // Häuser („im 7. Haus", „7. Haus")
  for (const m of antwort.matchAll(/\b(\d{1,2})\.\s*Haus\b/g)) {
    const h = Number(m[1]);
    if (h >= 1 && h <= 12) push(`${h}. Haus — ${HOUSE[h - 1]}`, { kind: "house", key: h });
  }
  return out.slice(0, limit);
}
