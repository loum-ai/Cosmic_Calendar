import { CHART, ASC, SN, HOUSE, THEME, signName, houseOf, computeAspects } from "./data";
import { craft } from "./genReadings";

/**
 * Chart-level synthesis — the "special", whole-chart insights that sit above
 * the per-placement readings: aspect configurations, stelliums, dominances,
 * lunar phase, hemisphere emphasis, chart ruler. All derived from the actual
 * chart (never hardcoded), so they hold for any birth data.
 *
 * WICHTIG (2026-07): `text` ist die BEOBACHTUNG — welche Konfiguration liegt
 * vor, aus welchen Kräften, in welchem Zeichen/Haus. Die ist aus dem Chart
 * gerechnet und darum echt. Die DEUTUNG dazu („Für dich konkret") wird über
 * `task` erzeugt; `detail` ist nur noch die Rückfallebene, solange sie lädt
 * oder nicht kommt. Vorher stand dort eine Schablone, die jeder Mensch mit
 * derselben Konfiguration wortgleich las.
 */
export interface Pattern {
  id: string;
  kind: "muster" | "fokus" | "balance" | "rhythmus";
  /** technical name (jargon) — shown as the small eyebrow, never the headline */
  title: string;
  /** the MEANING in plain German — this is the headline a person reads */
  human: string;
  /** die Beobachtung: was steht da, aus dem Chart gerechnet */
  text: string;
  /** Rückfalltext für „Für dich konkret", wenn keine Deutung vorliegt */
  detail: string;
  /** Cache-Key der erzeugten Deutung zu diesem Muster */
  viewKey: string;
  /** Auftrag an die Deutungs-Funktion */
  task: string;
  glyphs: string[];
}

/** Auftrag für die „Für dich konkret"-Deutung eines Musters. `{{CRAFT}}` wird
 *  am Ende von `chartPatterns()` mit dem viewKey als Saat ersetzt, damit
 *  Einstieg und Alltagsbeleg je Karte rotieren. */
function patternTask(fakten: string, auftrag: string): string {
  return `Ein Mensch sieht auf seiner Horoskop-Seite eine Karte zu folgender Besonderheit seines Geburtsbildes:

${fakten}

Schreibe den Abschnitt „Für dich konkret" dazu — EIN Absatz, 3–4 kurze Sätze. Schreib ihn zu Ende: der letzte Satz muss abgeschlossen sein.
${auftrag}
Wiederhole die Konfiguration NICHT, sie steht schon über deinem Text. Steig direkt bei dem ein, was sie für diesen Menschen bedeutet.
{{CRAFT}}`;
}

const MAJORS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const norm = (d: number) => ((d % 360) + 360) % 360;
const lc = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const elemIdxOf = (lon: number) => { const i = SN.indexOf(signName(lon)); return i < 0 ? 0 : i % 4; };
const lonOf = (k: string) => CHART.find((p) => p.key === k)?.lon ?? 0;

const ELEM = ["Feuer", "Erde", "Luft", "Wasser"];
const ELEM_TRAIT = ["Tatkraft, Begeisterung und Mut", "Bodenhaftung, Geduld und Verlässlichkeit", "Denken, Austausch und Überblick", "Gefühl, Empathie und Tiefe"];
const ELEM_HUMAN = ["Du lebst aus Antrieb und Begeisterung", "Du baust auf das, was hält", "Du lebst von Ideen und Austausch", "Du fühlst, was andere übersehen"];
const MODE = ["kardinal", "fix", "veränderlich"];
const MODE_TRAIT = ["Initiative — du bringst Dinge ins Rollen", "Beständigkeit — du hältst Kurs und baust auf", "Anpassung — du bewegst dich flexibel mit"];

const MODE_HUMAN = ["Du bringst Dinge ins Rollen", "Du hältst, was du beginnst", "Du bleibst beweglich, wo andere feststecken"];
const PHASE_HUMAN = ["Du beginnst instinktiv und unbelastet", "Du kämpfst dich aus Altem frei", "Du baust aktiv an deinem Leben", "Du verfeinerst, bis es stimmt", "Du erkennst dich im Gegenüber", "Du gibst weiter, was du verstanden hast", "Du richtest dich neu aus", "Du schließt ab und lässt los"];
const RULER: Record<string, string> = {
  Widder: "mars", Stier: "venus", Zwillinge: "mercury", Krebs: "moon", Löwe: "sun", Jungfrau: "mercury",
  Waage: "venus", Skorpion: "pluto", Schütze: "jupiter", Steinbock: "saturn", Wassermann: "uranus", Fische: "neptune",
};

const PHASES = [
  ["Neumond", "Aufbruch aus der Stille — du beginnst Dinge instinktiv und unbelastet."],
  ["zunehmende Sichel", "Du kämpfst dich aus alten Mustern heraus und willst Neues wagen."],
  ["zunehmender Halbmond", "Entscheidung und Tatkraft — du baust aktiv an deinem Leben."],
  ["zunehmender Dreiviertelmond", "Feinschliff und Verfeinerung auf dem Weg zur Erfüllung."],
  ["Vollmond", "Bewusstheit und Beziehung — du siehst dich im Spiegel der anderen."],
  ["abnehmender Dreiviertelmond", "Teilen und Vermitteln — du gibst weiter, was du verstanden hast."],
  ["abnehmender Halbmond", "Sinnsuche und Umorientierung — du hinterfragst und richtest neu aus."],
  ["abnehmende Sichel", "Loslassen und Weisheit — du bringst einen Zyklus zum Abschluss."],
];

export function chartPatterns(): Pattern[] {
  const planets = CHART.filter((p) => MAJORS.includes(p.key));
  const aspects = computeAspects();
  const g = (k: string) => CHART.find((p) => p.key === k)?.glyph ?? "";
  const nm = (k: string) => CHART.find((p) => p.key === k)?.name ?? k;
  /** volle Stellung für den Deutungs-Auftrag — Name, Zeichen, Haus */
  const pos = (k: string) => {
    const p = CHART.find((x) => x.key === k);
    if (!p) return k;
    const h = p.house ?? houseOf(p.lon);
    return `${p.name} in ${signName(p.lon)}, ${h}. Haus (${HOUSE[h - 1]})`;
  };
  const rel = (k1: string, k2: string) => {
    const a = aspects.find((x) => (x.A.key === k1 && x.B.key === k2) || (x.A.key === k2 && x.B.key === k1));
    return a?.def.type ?? null;
  };
  const keys = planets.map((p) => p.key);
  const out: Pattern[] = [];
  const seen = new Set<string>();
  const sig = (ks: string[]) => ks.slice().sort().join("|");

  // ── aspect configurations ──
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++)
      for (let k = j + 1; k < keys.length; k++) {
        const [a, b, c] = [keys[i], keys[j], keys[k]];
        const ab = rel(a, b), bc = rel(b, c), ac = rel(a, c);
        // Großes Trigon
        if (ab === "Trigon" && bc === "Trigon" && ac === "Trigon" && !seen.has("gt" + sig([a, b, c]))) {
          seen.add("gt" + sig([a, b, c]));
          const eli = elemIdxOf(lonOf(a));
          out.push({ id: "gt" + sig([a, b, c]), kind: "muster", title: "Großes Trigon", human: "Ein Talent, das dich mühelos trägt", glyphs: [g(a), g(b), g(c)],
            text: `${nm(a)}, ${nm(b)} und ${nm(c)} stehen im gleichseitigen Dreieck zueinander, alle drei im Element ${ELEM[eli]}.`,
            viewKey: `pattern:gt:${sig([a, b, c])}:v2`,
            task: patternTask(
              `Großes Trigon (drei Kräfte im 120°-Dreieck, alle im Element ${ELEM[eli]} — ${ELEM_TRAIT[eli]}):\n- ${pos(a)}\n- ${pos(b)}\n- ${pos(c)}`,
              "Sag, was dieses eingebaute Talent im Alltag konkret kann, warum es so selbstverständlich ist, dass es leicht übersehen wird — und wo genau dieser Mensch es bewusst einsetzen könnte, statt es zu vergeuden. Nenne auch die Kehrseite: mühelos heißt oft ungefordert.",
            ),
            detail: `Alle drei verbinden sich im Element ${ELEM[eli]} — ${ELEM_TRAIT[eli]} fließen hier wie von selbst. Weil dir das so leichtfällt, nimmst du es kaum als Stärke wahr. Setz es bewusst ein: Genau hier kannst du vorangehen und anderen etwas geben, wo sie sich abmühen.` });
        }
        // T-Quadrat: opposition pair + apex square to both
        const trio = [[a, b, c], [b, c, a], [a, c, b]] as const;
        for (const [x, y, apex] of trio) {
          if (rel(x, y) === "Opposition" && rel(x, apex) === "Quadrat" && rel(y, apex) === "Quadrat" && !seen.has("tq" + sig([x, y, apex]))) {
            seen.add("tq" + sig([x, y, apex]));
            out.push({ id: "tq" + sig([x, y, apex]), kind: "muster", title: "T-Quadrat", human: "Die Spannung, die dich antreibt", glyphs: [g(x), g(y), g(apex)],
              text: `${nm(x)} und ${nm(y)} stehen sich gegenüber, ${nm(apex)} steht im rechten Winkel zu beiden.`,
              viewKey: `pattern:tq:${sig([x, y, apex])}:v2`,
              task: patternTask(
                `T-Quadrat (zwei Kräfte in Opposition, eine dritte im Quadrat zu beiden):\n- Pol A: ${pos(x)}\n- Pol B: ${pos(y)}\n- Scheitelpunkt (der Hebel): ${pos(apex)}`,
                `Sag, wie sich diese Spannung im Alltag anfühlt und woran dieser Mensch sie wiedererkennt. Erkläre, warum ${nm(apex)} der Hebel ist — was er dort konkret tun kann, damit der Druck zwischen den beiden Polen in Bewegung umschlägt. Benenne beides: was es kostet, wenn er es nicht tut, und welche Ausdauer daraus wächst, wenn er es tut.`,
              ),
              detail: `${nm(apex)} ist dein Hebel: Sobald du dort aktiv wirst und Verantwortung übernimmst, löst sich der Druck zwischen ${nm(x)} und ${nm(y)} in Bewegung auf. Unbewusst kehrt die Spannung als wiederkehrendes Thema zurück — bewusst genutzt wird sie zu Ausdauer und Durchsetzungskraft, die dich weit trägt.` });
          }
        }
      }

  // Großes Kreuz: two oppositions whose ends are all square
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++) {
      if (rel(keys[i], keys[j]) !== "Opposition") continue;
      for (let m = j + 1; m < keys.length; m++)
        for (let n = m + 1; n < keys.length; n++) {
          if (rel(keys[m], keys[n]) !== "Opposition") continue;
          const [a, b, c, d] = [keys[i], keys[j], keys[m], keys[n]];
          if (rel(a, c) === "Quadrat" && rel(a, d) === "Quadrat" && rel(b, c) === "Quadrat" && rel(b, d) === "Quadrat" && !seen.has("gk" + sig([a, b, c, d]))) {
            seen.add("gk" + sig([a, b, c, d]));
            out.push({ id: "gk" + sig([a, b, c, d]), kind: "muster", title: "Großes Kreuz", human: "Vier Pole, die dich stark machen", glyphs: [g(a), g(b), g(c), g(d)],
              text: `${nm(a)}, ${nm(c)}, ${nm(b)} und ${nm(d)} bilden ein Kreuz: zwei Oppositionen, deren Enden alle im rechten Winkel zueinander stehen.`,
              viewKey: `pattern:gk:${sig([a, b, c, d])}:v2`,
              task: patternTask(
                `Großes Kreuz (zwei Oppositionen, alle Enden im Quadrat zueinander):\n- ${pos(a)}\n- ${pos(b)}\n- ${pos(c)}\n- ${pos(d)}`,
                "Sag, wie sich diese Dauerbalance im Alltag anfühlt und woran dieser Mensch merkt, dass er alle vier gleichzeitig bedienen will. Gib einen konkreten Umgang damit. Benenne ehrlich die Last UND die Standfestigkeit, die daraus wächst.",
              ),
              detail: `Vier gleichwertige Kräfte verlangen ständig deine Balance — das kann sich zeitweise nach Dauerlast anfühlen. Die Kunst ist, die Pole reihum zu bedienen statt alle gleichzeitig. Wer das lernt, entwickelt eine Standfestigkeit und Ausdauer, um die viele ihn beneiden.` });
          }
        }
    }

  // ── stellium (≥3 majors in one sign) ──
  const bySign: Record<string, string[]> = {};
  for (const p of planets) (bySign[signName(p.lon)] ??= []).push(p.key);
  for (const [sign, ks] of Object.entries(bySign))
    if (ks.length >= 3)
      out.push({ id: "stellium" + sign, kind: "fokus", title: `Stellium in ${sign}`, human: `Viel gebündelte Kraft in ${sign}`, glyphs: ks.map(g),
        text: `${ks.map(nm).join(", ")} sammeln sich in ${sign} — ${ks.length} von ${planets.length} Kräften in einem Zeichen.`,
        viewKey: `pattern:stellium:${sign}:${sig(ks)}:v2`,
        task: patternTask(
          `Stellium in ${sign} (${ks.length} Kräfte in einem Zeichen):\n${ks.map((k) => `- ${pos(k)}`).join("\n")}`,
          `Sag, wie sich diese Bündelung im Alltag zeigt — woran dieser Mensch sie an sich selbst bemerkt. Nutze dafür AUCH die Häuser oben: wenn die Kräfte in verschiedenen Häusern stehen, sag, welche Lebensbereiche dadurch zusammenhängen. Benenne die Kompetenz, die daraus wächst, und die Einseitigkeit, die droht — und was ihn ausgleicht.`,
        ),
        detail: `Mit ${ks.length} Kräften in ${sign} bündelt sich ein Großteil deiner Energie auf einem Gebiet. Das macht dich dort außergewöhnlich intensiv und kompetent — kann aber auch einseitig werden. Nimm die übrigen Lebensbereiche bewusst mit, damit dieses Thema dich trägt, statt dich zu verschlucken.` });

  // ── element / modality dominance + lack ──
  const e = [0, 0, 0, 0], m = [0, 0, 0];
  for (const p of CHART) { const si = SN.indexOf(signName(p.lon)); if (si < 0) continue; e[si % 4]++; m[si % 3]++; }
  const eMax = e.indexOf(Math.max(...e));
  const lack = e.indexOf(0);
  const fehlt = Math.min(...e) === 0;
  const verteilung = ELEM.map((l, i) => `${l}: ${e[i]}`).join(", ");
  out.push({ id: "elem", kind: "balance", title: `${ELEM[eMax]}-betont`, human: ELEM_HUMAN[eMax], glyphs: [],
    text: `Verteilung deiner Kräfte über die Elemente — ${verteilung}.` + (fehlt ? ` ${ELEM[lack]} ist unbesetzt.` : ""),
    viewKey: `pattern:elem:${e.join("-")}:v2`,
    task: patternTask(
      `Element-Verteilung der Kräfte im Geburtsbild: ${verteilung}.\nStärkstes Element: ${ELEM[eMax]} (${ELEM_TRAIT[eMax]}).${fehlt ? `\nUnbesetzt: ${ELEM[lack]} (${ELEM_TRAIT[lack]}).` : ""}`,
      `Sag, wie sich dieses Übergewicht im Verhalten dieses Menschen zeigt — an einer konkreten Alltagssituation.${fehlt ? ` Sag dann, was das unbesetzte Element ${ELEM[lack]} für ihn bedeutet: nicht als Defizit, sondern als etwas, das er sich über andere Menschen und Situationen erschließt.` : " Sag, wie die schwächer besetzten Elemente trotzdem mitspielen."}`,
    ),
    detail: `Konkret heißt das: ${ELEM_TRAIT[eMax]} sind deine natürliche Sprache.` + (fehlt ? ` Das fehlende Element ${ELEM[lack]} — ${ELEM_TRAIT[lack]} — ist dein Wachstumsfeld; Menschen und Situationen, die es verkörpern, fordern und bereichern dich besonders.` : ` Dein Bild ist dabei gut durchmischt, sodass die anderen Elemente ausgleichend mitwirken.`) });
  const mMax = m.indexOf(Math.max(...m));
  out.push({ id: "mode", kind: "balance", title: `Überwiegend ${MODE[mMax]}`, human: MODE_HUMAN[mMax], glyphs: [],
    text: `Verteilung über die Modi — ${MODE.map((l, i) => `${l}: ${m[i]}`).join(", ")}.`,
    viewKey: `pattern:mode:${m.join("-")}:v2`,
    task: patternTask(
      `Modus-Verteilung der Kräfte im Geburtsbild: ${MODE.map((l, i) => `${l}: ${m[i]}`).join(", ")}.\nÜberwiegend ${MODE[mMax]}: ${MODE_TRAIT[mMax]}.`,
      "Sag, wie dieser Grundrhythmus im Alltag aussieht — wie dieser Mensch typischerweise an Vorhaben herangeht, wo er stark ist und wo genau ihm dieser Rhythmus im Weg steht.",
    ),
    detail: `Im Alltag zeigt sich das daran, dass du ${mMax === 0 ? "gern startest, Impulse gibst und Dinge ins Rollen bringst" : mMax === 1 ? "Begonnenes konsequent zu Ende bringst und Kurs hältst" : "dich geschmeidig an Veränderungen anpasst und mehrere Wege offenhältst"}. Deine anderen Anteile runden das ab, sodass du nicht in einem Modus feststeckst.` });

  // ── dominant planet (most aspects) ──
  const cnt: Record<string, number> = {};
  for (const a of aspects) { cnt[a.A.key] = (cnt[a.A.key] ?? 0) + 1; cnt[a.B.key] = (cnt[a.B.key] ?? 0) + 1; }
  const domKey = Object.entries(cnt).filter(([k]) => MAJORS.includes(k)).sort((x, y) => y[1] - x[1])[0]?.[0];
  if (domKey)
    out.push({ id: "dom", kind: "fokus", title: `${nm(domKey)} als Taktgeber`, human: `${THEME[domKey] ?? nm(domKey)} zieht bei dir die Fäden`, glyphs: [g(domKey)],
      text: `${pos(domKey)} — mit ${cnt[domKey]} Verbindungen die am stärksten verknüpfte Kraft deines Bildes.`,
      viewKey: `pattern:dom:${domKey}:${cnt[domKey]}:v2`,
      task: patternTask(
        `Am stärksten verknüpfte Kraft im Geburtsbild: ${pos(domKey)} mit ${cnt[domKey]} Aspekten.\nSein Thema: ${THEME[domKey] ?? nm(domKey)}.\nSeine Verbindungen: ${aspects.filter((x) => x.A.key === domKey || x.B.key === domKey).map((x) => `${x.A.name} ${x.def.type} ${x.B.name}`).join("; ")}`,
        `Sag, woran dieser Mensch merkt, dass ${lc(THEME[domKey] ?? nm(domKey))} sich durch fast alles bei ihm zieht — an einer konkreten Situation. Sag auch, was passiert, wenn er dieses Prinzip nicht bewusst führt.`,
      ),
      detail: `Weil ${nm(domKey)} so viele Verbindungen hat, mischt sein Thema fast überall mit: ${lc(THEME[domKey] ?? nm(domKey))} zieht sich als roter Faden durch viele Lebensbereiche. Wenn du dieses eine Prinzip verstehst und bewusst führst, ordnet sich vieles andere wie von selbst.` });

  // ── chart ruler ──
  const ascSign = signName(ASC);
  const rulerKey = RULER[ascSign];
  const ruler = CHART.find((p) => p.key === rulerKey);
  if (ruler)
    out.push({ id: "ruler", kind: "fokus", title: `Chart-Herrscher: ${ruler.name}`, human: `${THEME[rulerKey] ?? ruler.name} führt dein ganzes Bild an`, glyphs: [ruler.glyph],
      text: `Dein Aszendent steht in ${ascSign} — Herrscher dieses Zeichens ist ${ruler.name}, bei dir ${pos(rulerKey)}.`,
      viewKey: `pattern:ruler:${rulerKey}:v2`,
      task: patternTask(
        `Aszendent in ${ascSign}, damit ist ${ruler.name} der Herrscher des ganzen Geburtsbildes.\nEr steht: ${pos(rulerKey)}.\nSein Thema: ${THEME[rulerKey] ?? ruler.name}.`,
        `Erkläre in einem Halbsatz, warum ausgerechnet dieser Planet das ganze Bild anführt (er beherrscht das Zeichen am Aszendenten). Sag dann, was seine konkrete Stellung für die Entwicklung dieses Menschen bedeutet — welcher Lebensbereich dadurch zum Dreh- und Angelpunkt wird und woran er das merkt.`,
      ),
      detail: `Wie es ${ruler.name} in ${signName(ruler.lon)} (${ruler.house ?? houseOf(ruler.lon)}. Haus) geht, so geht es dem ganzen Bild — dieser Planet ist dein wichtigster Bezugspunkt. ${THEME[rulerKey] ? `${THEME[rulerKey]} ist damit das übergeordnete Thema deines Weges.` : ""} Beobachte ihn als Wegweiser: Hier entscheidet sich, wohin sich dein Leben entwickeln will.` });

  // ── lunar phase at birth ──
  const sun = CHART.find((p) => p.key === "sun");
  const moon = CHART.find((p) => p.key === "moon");
  if (sun && moon) {
    const ang = norm(moon.lon - sun.lon);
    const [pn, pt] = PHASES[Math.floor(ang / 45) % 8];
    out.push({ id: "phase", kind: "rhythmus", title: `Geboren bei ${pn}`, human: PHASE_HUMAN[Math.floor(ang / 45) % 8], glyphs: ["☉", "☽"],
      text: `Zwischen Sonne (${signName(sun.lon)}) und Mond (${signName(moon.lon)}) lagen bei deiner Geburt ${Math.round(ang)}° — ${pn}.`,
      viewKey: `pattern:phase:${Math.floor(ang / 45) % 8}:v2`,
      task: patternTask(
        `Mondphase bei der Geburt: ${pn} (${Math.round(ang)}° zwischen Sonne und Mond).\nSonne: ${pos("sun")}\nMond: ${pos("moon")}\nGrundzug dieser Phase: ${pt}`,
        "Sag, was dieser Grundrhythmus für das Timing dieses Menschen bedeutet — wann er in Fahrt kommt, wann nicht, und woran er merkt, dass er gegen den eigenen Takt arbeitet. Kein Zwang, sondern ein Muster, das er nutzen kann.",
      ),
      detail: `Die Mondphase bei deiner Geburt beschreibt deinen Grundrhythmus — nicht als Zwang, sondern als dein natürliches Timing. Wenn du ihm folgst, statt dagegen zu arbeiten, läuft vieles leichter und stimmiger. ${pt}` });
  }

  // priority: configurations & stelliums first, then dominances
  const rank: Record<string, number> = { muster: 0, fokus: 1, balance: 2, rhythmus: 3 };
  // Der Handwerks-Block wird erst hier eingesetzt — mit dem viewKey als Saat,
  // damit jede Musterkarte einen anderen Einstieg und einen anderen
  // Alltagsbeleg bekommt statt neunmal derselben Rhetorik.
  return out
    .map((p) => ({ ...p, task: p.task.replace("{{CRAFT}}", craft(p.viewKey)) }))
    .sort((a, b) => rank[a.kind] - rank[b.kind]);
}
