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

export type SheetKind = "planet" | "node" | "house" | "sign" | "aspect" | "asptype";

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
      return {
        title: "Aszendent",
        glyph: "AC",
        color: "#c4a6ff",
        sections: [
          { label: "Was ist das?", body: PINFO.asc.what },
          { label: "Bei dir", body: `Dein Aszendent steht in ${signName(ASC)}.`, accent: MINT },
        ],
      };
    }
    const p = CHART.find((x) => x.key === key);
    if (!p) return null;
    const info = PINFO[p.key];
    const asp = computeAspects().filter((a) => a.A.key === p.key || a.B.key === p.key);
    return {
      title: `${p.name} — ${info.role}`,
      glyph: p.glyph,
      color: "#e7dcff",
      sections: [
        { label: "Was ist das?", body: info.what },
        { label: "Bei dir", body: `${p.txt} Steht in ${signName(p.lon)}, Haus ${houseOf(p.lon)}.`, accent: MINT },
      ],
      relations: asp.map((a) => {
        const other = a.A.key === p.key ? a.B : a.A;
        return {
          key: a.key,
          label: `${a.def.type} zu ${other.name}`,
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
    return {
      title: n.name,
      glyph: n.glyph,
      color: "#9bc0ff",
      sections: [
        { label: "Was ist das?", body: PINFO[n.key].what },
        { label: "Bei dir", body: `${n.name} steht in ${signName(n.lon)}. ${SIGNWHAT[SN.indexOf(signName(n.lon))]}`, accent: MINT },
      ],
    };
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
