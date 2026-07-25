/**
 * Tap-to-understand engine. Given a sheet descriptor, resolves the
 * "Was ist das?" + "Bei dir" content shown in the bottom sheet. Ported
 * from the prototype's buildSheet(). Every explainable element in the app
 * routes through here, so explanations are consistent and never missing.
 */
import {
  ASC,
  ASPDEF,
  CHART,
  HOUSE,
  HOUSEWHAT,
  HOUSEWHY,
  IS_DEMO,
  NODES,
  PINFO,
  SG,
  SIGNMEAN,
  SIGNWHAT,
  SN,
  THEME,
  computeAspects,
  houseOf,
  signName,
} from "./data";
import type { Aspect } from "./data";
import { GLOSSARY } from "./glossary";
import { READINGS, ASPECT_TEXT } from "./readings";
import { aiSign, aiHouse, aiAspect } from "./interpret";

export type SheetKind = "planet" | "node" | "house" | "sign" | "aspect" | "asptype" | "glossary";

export interface SheetDescriptor {
  kind: SheetKind;
  key: string | number;
}

export interface SheetSection {
  label: string;
  body: string;
  accent?: string;
  /**
   * Woher der Text kommt:
   *   "ai"      — eine ECHTE Deutung dieses Charts (Cockpit-Interpretation
   *               bzw. die bespoke Demo-Texte). Darf als „deine Deutung" laufen.
   *   "general" — Lexikon: gilt für jeden Menschen mit dieser Stellung.
   *               Erklärt das System, ist NIE die persönliche Deutung.
   * Die Oberflächen trennen danach: Lexikon oben, Deutung im „Vela deutet"-Block.
   */
  source?: "ai" | "general";
}

export interface SheetRelation {
  key: string;
  label: string;
  color: string;
  glyph: string;
  text: string;
  /** "ai" = `text` ist die echte Deutung dieses Charts. Fehlt die Angabe, ist
   *  `text` nur die aus dem Chart gerechnete Beobachtung — dann holt die
   *  Oberfläche die Deutung nach, statt die Schablone stehen zu lassen. */
  source?: "ai";
}

export interface SheetContent {
  title: string;
  glyph: string;
  color: string;
  sections: SheetSection[];
  relations?: SheetRelation[];
}

const MINT = "#20F0D0";
const lc = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** Erster vollständiger Satz eines Textes — als Vorschauzeile. */
export function firstSentence(t: string): string {
  const m = t.trim().match(/^[\s\S]*?[.!?](?=\s|$)/);
  return (m ? m[0] : t.trim()).trim();
}

/**
 * Eine Stellungs-Zeile entsteht NUR, wenn es dafür eine echte Deutung gibt
 * (Cockpit-Interpretation oder bespoke Demo-Text). Vorher fiel sie auf die
 * generische Zeichen-/Haus-Zeile zurück — und die landete in der Oberfläche
 * im Block „Vela deutet · für dich". Genau das las sich bei jedem Kunden
 * gleich. Fehlt die echte Deutung, bleibt der Platz leer und die generierte
 * Craft-Deutung füllt ihn.
 */
function placement(label: string, text: string | null | undefined | false): SheetSection | null {
  return text ? { label, body: text, source: "ai" } : null;
}

const compact = (secs: (SheetSection | null)[]): SheetSection[] => secs.filter((s): s is SheetSection => !!s);

/** Vorschauzeile für eine Verbindung (die „Verbindungen"-Liste unter einer
 *  Stellung). Nimmt die ECHTE Deutung, wenn es sie gibt; sonst einen Satz, der
 *  immer noch aus DIESEM Chart folgt (welche zwei Kräfte, was sie tun, wie eng).
 *  Nie wieder ein „tippe für deine Deutung"-Platzhalter — der stand vorher
 *  unter jedem einzelnen Planeten-Sheet. */
function relText(a: Aspect): { text: string; source?: "ai" } {
  const real = aiAspect(a.A.key, a.B.key) || (IS_DEMO ? ASPECT_TEXT[a.key] : "");
  if (real) return { text: firstSentence(real), source: "ai" };
  // Keine gespeicherte Deutung: die reine BEOBACHTUNG aus diesem Chart, kein
  // gedeuteter Satz. Der Cockpit-Lauf deckt nur die 14 engsten Aspekte ab —
  // gemessen fehlten dadurch bei einem Kunden 13 von 27. Die Oberfläche holt
  // die Deutung dafür nach (siehe SheetRelation.source).
  const tA = THEME[a.A.key] ?? a.A.name;
  const tB = THEME[a.B.key] ? lc(THEME[a.B.key]) : a.B.name;
  const naehe =
    a.orb < 1.5
      ? "sehr eng — eine der prägendsten Verbindungen deines Bildes"
      : a.orb < 3.5
        ? "eng genug, um im Alltag deutlich spürbar zu sein"
        : "weiter gefasst — wirkt eher als Grundton denn als Paukenschlag";
  // Kein „Orbis" im Fließtext — die Gradzahl steht im Label darüber, hier
  // zählt die Aussage: wie eng, und was das heißt.
  return { text: `${tA} trifft ${tB} — ${naehe}.` };
}

export function resolveSheet(d: SheetDescriptor): SheetContent | null {
  const { kind, key } = d;

  if (kind === "planet") {
    if (key === "asc") {
      const sun = CHART.find((x) => x.key === "sun");
      const sameSign = !!sun && signName(sun.lon) === signName(ASC);
      return {
        title: "Aszendent",
        glyph: "AC",
        color: "#c4a6ff",
        sections: compact([
          { label: "Was — die Maske nach außen", body: PINFO.asc.what, source: "general" },
          placement(`Wie — Aszendent in ${signName(ASC)}`, aiSign("asc") || (IS_DEMO && READINGS.asc?.sign)),
          {
            label: "Bei dir",
            body: sameSign
              ? `Dein Aszendent steht in ${signName(ASC)} — und deine Sonne auch: Wie du wirkst und wer du bist, fallen bei dir ungewöhnlich stark zusammen. Was andere zuerst sehen, ist schon ziemlich nah an deinem Kern.`
              : `Dein Aszendent steht in ${signName(ASC)} — so trittst du auf, bevor du ein Wort sagst. Deine Sonne steht aber in ${sun ? signName(sun.lon) : "einem anderen Zeichen"}: Der erste Eindruck ist bei dir also die Tür, nicht das Haus — wer bleibt, erlebt dahinter einen anderen Kern als die Fassade vermuten lässt.`,
            accent: MINT,
          },
        ]),
      };
    }
    const p = CHART.find((x) => x.key === key);
    if (!p) return null;
    const info = PINFO[p.key];
    const h = p.house ?? houseOf(p.lon);
    const asp = computeAspects().filter((a) => a.A.key === p.key || a.B.key === p.key);
    return {
      title: `${p.name} — ${info.role}`,
      glyph: p.glyph,
      color: "#e7dcff",
      sections: compact([
        { label: "Was — der Planet", body: info.what, source: "general" },
        placement(`Wie — ${p.name} in ${signName(p.lon)}`, aiSign(p.key) || (IS_DEMO && READINGS[p.key]?.sign)),
        { label: `Warum — das ${h}. Haus`, body: HOUSEWHY[h - 1], source: "general" },
        placement(`Wo — ${h}. Haus · ${HOUSE[h - 1]}`, aiHouse(p.key) || (IS_DEMO && READINGS[p.key]?.house)),
        { label: "Bei dir", body: p.txt || `${THEME[p.key] ?? p.name} drückt sich bei dir über ${signName(p.lon)} im ${h}. Haus aus — dem Bereich „${HOUSE[h - 1]}". ${asp.length ? `${p.name} ist dabei mit ${asp.length === 1 ? "einer weiteren Kraft" : `${asp.length} weiteren Kräften`} deines Bildes verbunden — was hier passiert, färbt also auch andere Lebensbereiche mit. Die Verbindungen stehen unten.` : `${p.name} steht dabei ohne enge Verbindungen — diese Kraft wirkt bei dir eigenständig und unvermischt.`}`, accent: MINT },
      ]),
      relations: asp.map((a) => {
        const other = a.A.key === p.key ? a.B : a.A;
        return {
          key: a.key,
          label: `${a.def.type} zu ${other.name} · ${a.orb.toFixed(1)}°`,
          color: a.def.c,
          glyph: a.def.g,
          ...relText(a),
        };
      }),
    };
  }

  if (kind === "node") {
    const n = NODES.find((x) => x.key === key);
    if (!n) return null;
    const r = READINGS[n.key];
    const idx = SN.indexOf(signName(n.lon));
    const sections: SheetSection[] = compact([
      { label: "Was — der Mondknoten", body: PINFO[n.key].what, source: "general" },
      placement(`Wie — in ${signName(n.lon)}`, aiSign(n.key) || (IS_DEMO && r?.sign)),
    ]);
    if (IS_DEMO && r?.house) sections.push({ label: "Die Achse", body: r.house, source: "ai" });
    {
      const h = n.house ?? houseOf(n.lon);
      const area = HOUSE[h - 1];
      const trait = SIGNWHAT[idx] ?? "";
      const body =
        n.key === "node_n"
          ? `Dein Wachstumsweg führt nach ${signName(n.lon)} im ${h}. Haus — dem Bereich „${area}". ${trait} Genau diese Qualitäten dort zu entwickeln, fühlt sich anfangs ungewohnt an, ist aber deine Richtung.`
          : `Vertraut und mühelos: ${signName(n.lon)} im ${h}. Haus — „${area}". ${trait} Das ist dein bekanntes Terrain; du darfst es nach und nach loslassen, statt dich darin zu verstecken.`;
      sections.push({ label: "Bei dir", body, accent: MINT });
    }
    return { title: n.name, glyph: n.glyph, color: "#9bc0ff", sections };
  }

  if (kind === "house") {
    const h = Number(key);
    // p.house ist maßgeblich (Placidus aus der Berechnung) — houseOf() ist nur
    // die Gleich-Haus-Notlösung. Vorher listete das Haus-Sheet die Planeten nach
    // Gleich-Haus und widersprach damit dem Planeten-Sheet daneben.
    const ps = CHART.filter((p) => (p.house ?? houseOf(p.lon)) === h);
    return {
      title: `Haus ${h} — ${HOUSE[h - 1]}`,
      glyph: String(h),
      color: "#c4a6ff",
      sections: [
        { label: "Was ist das?", body: HOUSEWHAT[h - 1], source: "general" },
        { label: "Warum dieses Haus?", body: HOUSEWHY[h - 1], source: "general" },
        {
          label: "Bei dir",
          body: ps.length
            ? `${ps.map((p) => `${p.name} in ${signName(p.lon)}`).join(", ")} ${ps.length > 1 ? "stehen" : "steht"} in diesem Haus — „${HOUSE[h - 1]}" ist bei dir also kein Nebenschauplatz, sondern läuft direkt über ${lc(THEME[ps[0].key] ?? ps[0].name)}${ps.length > 1 ? ` und ${lc(THEME[ps[1].key] ?? ps[1].name)}` : ""}. Tippe die Planeten an, um zu sehen, wie genau.`
            : `Hier steht bei dir kein Planet — der Bereich „${HOUSE[h - 1]}" läuft eher leise im Hintergrund mit, statt ein Dauerthema zu sein. Gedeutet wird er trotzdem: über Planeten, die von anderen Häusern aus Verbindungen hierher knüpfen. Frag unten im Chat nach deinem ${h}. Haus, wenn du es genauer wissen willst.`,
          accent: MINT,
        },
      ],
    };
  }

  if (kind === "sign") {
    const s = String(key);
    const i = SN.indexOf(s);
    if (i < 0) return null;
    const ps = CHART.filter((p) => signName(p.lon) === s);
    return {
      title: `${s} — ${SIGNMEAN[i].split(" · ")[0]}`,
      glyph: SG[i],
      color: "#c4a6ff",
      sections: [
        { label: "Was ist das?", body: SIGNWHAT[i], source: "general" },
        {
          label: "Bei dir",
          body: ps.length
            ? `${ps.map((p) => p.name).join(", ")} ${ps.length > 1 ? "stehen" : "steht"} bei dir in ${s}. Sichtbar wird diese Färbung vor allem ${ps.map((p) => { const ph = p.house ?? houseOf(p.lon); return `im ${ph}. Haus (${HOUSE[ph - 1]})`; }).join(" und ")} — dort gibt ${s} bei dir den Ton an.`
            : `Kein Planet von dir steht in ${s}. Die Qualität dieses Zeichens — ${lc(SIGNWHAT[i])} — lebst du eher über Menschen und Situationen, die sie dir spiegeln, als unmittelbar aus dir selbst heraus.`,
          accent: MINT,
        },
      ],
    };
  }

  if (kind === "aspect") {
    const a = computeAspects().find((z) => z.key === key);
    if (!a) return null;
    return {
      title: `${a.A.name} ${a.def.type} ${a.B.name}`,
      glyph: a.def.g,
      color: a.def.c,
      sections: [
        { label: "Was ist das?", body: a.def.plain, source: "general" },
        { label: "Bei dir", body: aiAspect(a.A.key, a.B.key) || (IS_DEMO && ASPECT_TEXT[a.key]) || relText(a).text, accent: MINT },
        {
          label: "Wie eng",
          body:
            a.orb < 1.5
              ? `Sehr eng (${a.orb.toFixed(1)}°). Je kleiner dieser Abstand, desto deutlicher wirkt eine Verbindung — das hier ist eine der prägendsten deines Bildes.`
              : a.orb < 3.5
                ? `Eng (${a.orb.toFixed(1)}°). Je kleiner dieser Abstand, desto deutlicher wirkt eine Verbindung — diese spürst du im Alltag.`
                : `Weiter gefasst (${a.orb.toFixed(1)}°). Je kleiner dieser Abstand, desto deutlicher wirkt eine Verbindung — diese wirkt eher als Grundton.`,
          source: "general",
        },
      ],
    };
  }

  if (kind === "glossary") {
    const e = GLOSSARY[String(key).toLowerCase()];
    if (!e) return null;
    return {
      title: e.term,
      glyph: "?",
      color: "#b9a8ff",
      sections: [
        { label: "Klartext", body: e.short, source: "general" },
        { label: "Einfach gesagt", body: `Statt „${e.term}" kannst du auch sagen: ${e.plain}.`, source: "general" },
      ],
    };
  }

  if (kind === "asptype") {
    const d2 = ASPDEF[Number(key)];
    if (!d2) return null;
    const mine = computeAspects().filter((a) => a.def.type === d2.type);
    return {
      title: d2.type,
      glyph: d2.g,
      color: d2.c,
      sections: [
        { label: "Was ist das?", body: d2.plain, source: "general" },
        {
          label: "Bei dir",
          body: mine.length
            ? (() => {
                const tight = mine.reduce((x, y) => (x.orb < y.orb ? x : y), mine[0]);
                return `Diese Verbindung kommt bei dir ${mine.length}× vor: ${mine.map((a) => `${a.A.name}–${a.B.name}`).join(", ")}. Am engsten ist ${tight.A.name}–${tight.B.name} (${tight.orb.toFixed(1)}°) — dort wirkt dieses Muster bei dir am stärksten.`;
              })()
            : `Die ${d2.type} kommt in deinem Chart nicht vor — dieses Muster ist bei dir also kein zentrales Thema. Das ist weder gut noch schlecht, nur eine Eigenheit deines Bildes.`,
          accent: MINT,
        },
      ],
    };
  }

  return null;
}
