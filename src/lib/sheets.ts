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
import { GLOSSARY } from "./glossary";
import { READINGS } from "./readings";

export type SheetKind = "planet" | "node" | "house" | "sign" | "aspect" | "asptype" | "glossary";

export interface SheetDescriptor {
  kind: SheetKind;
  key: string | number;
}

export interface SheetSection {
  label: string;
  body: string;
  accent?: string;
}

export interface SheetRelation {
  key: string;
  label: string;
  color: string;
  glyph: string;
  text: string;
}

export interface SheetContent {
  title: string;
  glyph: string;
  color: string;
  sections: SheetSection[];
  relations?: SheetRelation[];
}

const MINT = "#2fde8c";

function relText(a: { A: { key: string; name: string }; B: { key: string; name: string }; def: { verb: string } }): string {
  const tA = THEME[a.A.key] || a.A.name;
  const tBraw = THEME[a.B.key] || a.B.name;
  const tB = tBraw.charAt(0).toLowerCase() + tBraw.slice(1);
  return `${tA} und ${tB} ${a.def.verb}.`;
}

export function resolveSheet(d: SheetDescriptor): SheetContent | null {
  const { kind, key } = d;

  if (kind === "planet") {
    if (key === "asc") {
      const si = SN.indexOf(signName(ASC));
      return {
        title: "Aszendent",
        glyph: "AC",
        color: "#c4a6ff",
        sections: [
          { label: "Was — die Maske nach außen", body: PINFO.asc.what },
          { label: `Wie — Aszendent in ${signName(ASC)}`, body: READINGS.asc?.sign ?? SIGNWHAT[si] },
          { label: "Bei dir", body: `Dein Aszendent steht in ${signName(ASC)} — so trittst du auf, bevor du ein Wort sagst.`, accent: MINT },
        ],
      };
    }
    const p = CHART.find((x) => x.key === key);
    if (!p) return null;
    const info = PINFO[p.key];
    const si = SN.indexOf(signName(p.lon));
    const h = p.house ?? houseOf(p.lon);
    const asp = computeAspects().filter((a) => a.A.key === p.key || a.B.key === p.key);
    return {
      title: `${p.name} — ${info.role}`,
      glyph: p.glyph,
      color: "#e7dcff",
      sections: [
        { label: "Was — der Planet", body: info.what },
        { label: `Wie — ${p.name} in ${signName(p.lon)}`, body: READINGS[p.key]?.sign ?? SIGNWHAT[si] },
        { label: `Wo — ${h}. Haus · ${HOUSE[h - 1]}`, body: READINGS[p.key]?.house ?? HOUSEWHAT[h - 1] },
        { label: "Bei dir", body: p.txt, accent: MINT },
      ],
      relations: asp.map((a) => {
        const other = a.A.key === p.key ? a.B : a.A;
        return {
          key: a.key,
          label: `${a.def.type} zu ${other.name} · ${a.orb.toFixed(1)}°`,
          color: a.def.c,
          glyph: a.def.g,
          text: relText(a),
        };
      }),
    };
  }

  if (kind === "node") {
    const n = NODES.find((x) => x.key === key);
    if (!n) return null;
    const r = READINGS[n.key];
    const idx = SN.indexOf(signName(n.lon));
    const sections: SheetSection[] = [
      { label: "Was — der Mondknoten", body: PINFO[n.key].what },
      { label: `Wie — in ${signName(n.lon)}`, body: r?.sign ?? SIGNWHAT[idx] },
    ];
    if (r?.house) sections.push({ label: "Die Achse", body: r.house });
    sections.push({
      label: "Bei dir",
      body: `${n.name} steht in ${signName(n.lon)}, Haus ${n.house ?? houseOf(n.lon)}.`,
      accent: MINT,
    });
    return { title: n.name, glyph: n.glyph, color: "#9bc0ff", sections };
  }

  if (kind === "house") {
    const h = Number(key);
    const ps = CHART.filter((p) => houseOf(p.lon) === h);
    return {
      title: `Haus ${h} — ${HOUSE[h - 1]}`,
      glyph: String(h),
      color: "#c4a6ff",
      sections: [
        { label: "Was ist das?", body: HOUSEWHAT[h - 1] },
        {
          label: "Bei dir",
          body: ps.length
            ? `${ps.map((p) => p.name).join(", ")} ${ps.length > 1 ? "stehen" : "steht"} in diesem Lebensbereich.`
            : "Hier steht bei dir kein Planet — der Bereich läuft eher leise mit.",
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
        { label: "Was ist das?", body: SIGNWHAT[i] },
        {
          label: "Bei dir",
          body: ps.length
            ? `Deine ${ps.map((p) => p.name).join(", ")} ${ps.length > 1 ? "tragen" : "trägt"} diese Färbung.`
            : "Kein Planet von dir steht in diesem Zeichen.",
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
        { label: "Was ist das?", body: a.def.plain },
        { label: "Bei dir", body: relText(a), accent: MINT },
        { label: "Genauigkeit", body: `${a.orb.toFixed(1)}° Orbis — je enger, desto stärker wirkt die Verbindung.` },
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
        { label: "Klartext", body: e.short },
        { label: "Einfach gesagt", body: `Statt „${e.term}" kannst du auch sagen: ${e.plain}.` },
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
        { label: "Was ist das?", body: d2.plain },
        {
          label: "Bei dir",
          body: mine.length ? mine.map((a) => `${a.A.name}–${a.B.name}`).join(", ") : "Diese Verbindung kommt in deinem Chart nicht vor.",
          accent: MINT,
        },
      ],
    };
  }

  return null;
}
