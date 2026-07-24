/**
 * Planeten-Artwork für die cinematic Cards.
 *
 * Herkunft: die Fotos und die Werte stammen aus dem lokalen Deploy vom
 * 24.07.2026 (Branch `gh-pages`, Commit 526dba1). Der Quellcode dieses Builds
 * lag in keinem Branch — die Bilder und die exakten Farb-/Zoom-Werte wurden
 * aus dem ausgelieferten Bundle zurückgeholt, damit das Design nicht verloren
 * geht.
 *
 * PLANET_RGB — Leuchtfarbe je Planet (Glow, Innenkante, Glyph).
 * PLANET_ZOOM — wie groß der Planet im Bild sitzt; gleicht aus, dass die Fotos
 * unterschiedlich weit gerahmt sind (Saturn füllt viel, Pluto wenig).
 */
import sonne from "@/assets/planets/sonne.jpg";
import mond from "@/assets/planets/mond.jpg";
import merkur from "@/assets/planets/merkur.jpg";
import venus from "@/assets/planets/venus.jpg";
import mars from "@/assets/planets/mars.jpg";
import jupiter from "@/assets/planets/jupiter.jpg";
import saturn from "@/assets/planets/saturn.jpg";
import uranus from "@/assets/planets/uranus.jpg";
import neptun from "@/assets/planets/neptun.jpg";
import pluto from "@/assets/planets/pluto.jpg";

export const PLANET_PHOTO: Record<string, string> = {
  sun: sonne,
  moon: mond,
  mercury: merkur,
  venus,
  mars,
  jupiter,
  saturn,
  uranus,
  neptune: neptun,
  pluto,
};

export const PLANET_RGB: Record<string, string> = {
  sun: "255,176,84",
  moon: "196,206,228",
  mercury: "206,180,150",
  venus: "246,206,150",
  mars: "236,116,78",
  jupiter: "236,180,120",
  saturn: "242,206,142",
  uranus: "142,216,226",
  neptune: "112,150,240",
  pluto: "198,150,142",
};

export const PLANET_ZOOM: Record<string, number> = {
  sun: 0.92,
  moon: 0.46,
  mercury: 0.48,
  venus: 0.6,
  mars: 0.48,
  jupiter: 1.08,
  saturn: 1.1,
  uranus: 0.78,
  neptune: 0.74,
  pluto: 0.36,
};

/** Fallback-Leuchtfarbe für Punkte ohne Foto (Chiron, Lilith, Knoten, AC). */
export const RGB_FALLBACK = "120,150,255";

export const planetPhoto = (key: string): string | null => PLANET_PHOTO[key] ?? null;
export const planetRgb = (key: string): string => PLANET_RGB[key] ?? RGB_FALLBACK;
export const planetZoom = (key: string): number => PLANET_ZOOM[key] ?? 0.6;

/** Der dunkle Karten-Grund, auf dem die Planetenfotos im Screen-Blend sitzen. */
export const CARD_BG = "linear-gradient(180deg,#191728 0%,#141221 58%,#100E1A 100%)";
