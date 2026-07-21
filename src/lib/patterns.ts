import { CHART, ASC, SN, THEME, signName, houseOf, computeAspects } from "./data";

/**
 * Chart-level synthesis — the "special", whole-chart insights that sit above
 * the per-placement readings: aspect configurations, stelliums, dominances,
 * lunar phase, hemisphere emphasis, chart ruler. All derived from the actual
 * chart (never hardcoded), so they hold for any birth data.
 */
export interface Pattern {
  id: string;
  kind: "muster" | "fokus" | "balance" | "rhythmus";
  /** technical name (jargon) — shown as the small eyebrow, never the headline */
  title: string;
  /** the MEANING in plain German — this is the headline a person reads */
  human: string;
  text: string;
  /** the deeper, client-specific reading shown when the card is expanded */
  detail: string;
  glyphs: string[];
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
  ["Neumond", "Aufbruch aus dem Dunkeln — du beginnst Dinge instinktiv und unbelastet."],
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
            text: `${nm(a)}, ${nm(b)} und ${nm(c)} bilden ein gleichseitiges Dreieck — ein eingebautes Talent, das mühelos fließt. Begabung, die dir so selbstverständlich ist, dass du sie leicht übersiehst.`,
            detail: `Alle drei verbinden sich im Element ${ELEM[eli]} — ${ELEM_TRAIT[eli]} fließen hier wie von selbst. Weil dir das so leichtfällt, nimmst du es kaum als Stärke wahr. Setz es bewusst ein: Genau hier kannst du vorangehen und anderen etwas geben, wo sie sich abmühen.` });
        }
        // T-Quadrat: opposition pair + apex square to both
        const trio = [[a, b, c], [b, c, a], [a, c, b]] as const;
        for (const [x, y, apex] of trio) {
          if (rel(x, y) === "Opposition" && rel(x, apex) === "Quadrat" && rel(y, apex) === "Quadrat" && !seen.has("tq" + sig([x, y, apex]))) {
            seen.add("tq" + sig([x, y, apex]));
            out.push({ id: "tq" + sig([x, y, apex]), kind: "muster", title: "T-Quadrat", human: "Die Spannung, die dich antreibt", glyphs: [g(x), g(y), g(apex)],
              text: `${nm(x)} und ${nm(y)} stehen sich gegenüber, ${nm(apex)} drückt auf beide — ein Spannungsmotor, der dich antreibt. Hier liegt Reibung, aber auch deine größte Schubkraft; ${nm(apex)} zeigt, wo du sie löst.`,
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
              text: `Vier Kräfte (${nm(a)}, ${nm(c)}, ${nm(b)}, ${nm(d)}) in einem Kreuz aus Spannung — enorme Belastbarkeit und Antrieb. Du jonglierst viele Pole gleichzeitig; gemeistert wirst du dadurch außerordentlich widerstandsfähig.`,
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
        text: `${ks.map(nm).join(", ")} sammeln sich in ${sign} — ein starker Brennpunkt deines Bildes. Sehr viel Energie konzentriert sich auf dieses eine Lebensthema; es prägt dich überdurchschnittlich.`,
        detail: `Mit ${ks.length} Kräften in ${sign} bündelt sich ein Großteil deiner Energie auf einem Gebiet. Das macht dich dort außergewöhnlich intensiv und kompetent — kann aber auch einseitig werden. Nimm die übrigen Lebensbereiche bewusst mit, damit dieses Thema dich trägt, statt dich zu verschlucken.` });

  // ── element / modality dominance + lack ──
  const e = [0, 0, 0, 0], m = [0, 0, 0];
  for (const p of CHART) { const si = SN.indexOf(signName(p.lon)); if (si < 0) continue; e[si % 4]++; m[si % 3]++; }
  const eMax = e.indexOf(Math.max(...e));
  const lack = e.indexOf(0);
  out.push({ id: "elem", kind: "balance", title: `${ELEM[eMax]}-betont`, human: ELEM_HUMAN[eMax], glyphs: [],
    text: `Dein Bild ist deutlich von ${ELEM[eMax]} geprägt — ${ELEM_TRAIT[eMax]} stehen im Vordergrund.` + (Math.min(...e) === 0 ? ` Dafür fehlt ${ELEM[lack]} fast ganz — ein Bereich, den du dir bewusst erschließen darfst.` : ""),
    detail: `Konkret heißt das: ${ELEM_TRAIT[eMax]} sind deine natürliche Sprache.` + (Math.min(...e) === 0 ? ` Das fehlende Element ${ELEM[lack]} — ${ELEM_TRAIT[lack]} — ist dein Wachstumsfeld; Menschen und Situationen, die es verkörpern, fordern und bereichern dich besonders.` : ` Dein Bild ist dabei gut durchmischt, sodass die anderen Elemente ausgleichend mitwirken.`) });
  const mMax = m.indexOf(Math.max(...m));
  out.push({ id: "mode", kind: "balance", title: `Überwiegend ${MODE[mMax]}`, human: MODE_HUMAN[mMax], glyphs: [],
    text: `Im Rhythmus überwiegt das ${MODE[mMax]}e Prinzip: ${MODE_TRAIT[mMax]}.`,
    detail: `Im Alltag zeigt sich das daran, dass du ${mMax === 0 ? "gern startest, Impulse gibst und Dinge ins Rollen bringst" : mMax === 1 ? "Begonnenes konsequent zu Ende bringst und Kurs hältst" : "dich geschmeidig an Veränderungen anpasst und mehrere Wege offenhältst"}. Deine anderen Anteile runden das ab, sodass du nicht in einem Modus feststeckst.` });

  // ── dominant planet (most aspects) ──
  const cnt: Record<string, number> = {};
  for (const a of aspects) { cnt[a.A.key] = (cnt[a.A.key] ?? 0) + 1; cnt[a.B.key] = (cnt[a.B.key] ?? 0) + 1; }
  const domKey = Object.entries(cnt).filter(([k]) => MAJORS.includes(k)).sort((x, y) => y[1] - x[1])[0]?.[0];
  if (domKey)
    out.push({ id: "dom", kind: "fokus", title: `${nm(domKey)} als Taktgeber`, human: `${THEME[domKey] ?? nm(domKey)} zieht bei dir die Fäden`, glyphs: [g(domKey)],
      text: `${nm(domKey)} ist am stärksten verknüpft (${cnt[domKey]} Aspekte) — er zieht die meisten Fäden in deinem Bild. Sein Thema färbt überraschend viele Lebensbereiche.`,
      detail: `Weil ${nm(domKey)} so viele Verbindungen hat, mischt sein Thema fast überall mit: ${lc(THEME[domKey] ?? nm(domKey))} zieht sich als roter Faden durch viele Lebensbereiche. Wenn du dieses eine Prinzip verstehst und bewusst führst, ordnet sich vieles andere wie von selbst.` });

  // ── chart ruler ──
  const ascSign = signName(ASC);
  const rulerKey = RULER[ascSign];
  const ruler = CHART.find((p) => p.key === rulerKey);
  if (ruler)
    out.push({ id: "ruler", kind: "fokus", title: `Chart-Herrscher: ${ruler.name}`, human: `${THEME[rulerKey] ?? ruler.name} führt dein ganzes Bild an`, glyphs: [ruler.glyph],
      text: `Dein Aszendent steht in ${ascSign}, also führt ${ruler.name} dein ganzes Bild an — und steht bei dir in ${signName(ruler.lon)}, ${ruler.house ?? houseOf(ruler.lon)}. Haus. Dort liegt der rote Faden deiner Entwicklung.`,
      detail: `Wie es ${ruler.name} in ${signName(ruler.lon)} (${ruler.house ?? houseOf(ruler.lon)}. Haus) geht, so geht es dem ganzen Bild — dieser Planet ist dein Leitstern. ${THEME[rulerKey] ? `${THEME[rulerKey]} ist damit das übergeordnete Thema deines Weges.` : ""} Beobachte ihn als Wegweiser: Hier entscheidet sich, wohin sich dein Leben entwickeln will.` });

  // ── lunar phase at birth ──
  const sun = CHART.find((p) => p.key === "sun");
  const moon = CHART.find((p) => p.key === "moon");
  if (sun && moon) {
    const ang = norm(moon.lon - sun.lon);
    const [pn, pt] = PHASES[Math.floor(ang / 45) % 8];
    out.push({ id: "phase", kind: "rhythmus", title: `Geboren bei ${pn}`, human: PHASE_HUMAN[Math.floor(ang / 45) % 8], glyphs: ["☉", "☽"], text: pt,
      detail: `Die Mondphase bei deiner Geburt beschreibt deinen Grundrhythmus — nicht als Zwang, sondern als dein natürliches Timing. Wenn du ihm folgst, statt dagegen zu arbeiten, läuft vieles leichter und stimmiger.` });
  }

  // priority: configurations & stelliums first, then dominances
  const rank: Record<string, number> = { muster: 0, fokus: 1, balance: 2, rhythmus: 3 };
  return out.sort((a, b) => rank[a.kind] - rank[b.kind]);
}
