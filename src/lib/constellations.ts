/**
 * constellations.ts — Echte astronomische Daten der 12 Tierkreis-Sternbilder.
 *
 * Recherche-Datum: 2026-07-23
 * Alle Werte stammen aus offenen, maschinenlesbaren Katalogen — keine geschätzten
 * oder erfundenen Positionen. Erzeugt durch Join der beiden folgenden Quellen.
 *
 * QUELLE 1 — Strichfiguren (Verbindungslinien)
 *   Stellarium, Sky Culture "modern_iau", Datei skycultures/modern_iau/index.json
 *   https://github.com/Stellarium/stellarium/blob/master/skycultures/modern_iau/index.json
 *   Format: pro Sternbild ein Array von Polylinien, jede Polylinie eine Folge von
 *   Hipparcos-(HIP-)Nummern. Hier zu Index-Paaren in `stars` aufgelöst.
 *   Konvention: die OFFIZIELLEN IAU-Sternbildfiguren, erstellt zusammen mit der
 *   Zeitschrift "Sky & Telescope" (Roger Sinnott, Rick Fienberg; Linienmuster von
 *   Alan MacRobert, an H. A. Rey angelehnt, aber an ältere Traditionen angepasst).
 *   Veröffentlicht auf der offiziellen IAU-Website (iau.org/public/themes/constellations).
 *   Das ist dieselbe Darstellung, die auf den offiziellen IAU-Sternkarten zu sehen ist.
 *
 * QUELLE 2 — Sternpositionen und Helligkeiten
 *   HYG Database v3.8 (astronexus/HYG-Database), Datei hyg/v3/hyg_v38.csv.gz
 *   https://github.com/astronexus/HYG-Database
 *   Kompilation aus Hipparcos, Yale Bright Star Catalogue (5. Aufl.) und Gliese.
 *   Übernommen: proper (IAU-Eigenname), bayer/flam (Bezeichnung), ra, dec, mag.
 *   ra liegt dort in Stunden vor und wurde mit ×15 in Grad umgerechnet.
 *   Epoche: J2000 / ICRS.
 *
 * GEGENGEPRÜFT — SIMBAD (CDS Strasbourg), TAP/ADQL-Abfrage über alle 143 Sterne
 *   https://simbad.u-strasbg.fr/simbad/sim-tap
 *   Alle 143 Sterne gefunden. Positionsabweichung HYG↔SIMBAD: Median 0,15",
 *   Maximum 0,96" — also durchweg unter einer Bogensekunde und für Sternkarten
 *   vollkommen vernachlässigbar. Helligkeiten: Median-Abweichung 0,01 mag,
 *   Maximum 0,22 mag; die größten Abweichungen betreffen bekannte Veränderliche
 *   (ζ Gem = Cepheid, α Sco/Antares, π Aqr, ε Gem) und sind daher zu erwarten.
 *   Die Bezeichnung "G Sco" (HIP 87261, Fuyue) trägt weder Bayer- noch
 *   Flamsteed-Bezeichnung und wurde einzeln über SIMBAD verifiziert.
 *
 * EINHEITEN
 *   ra   Rektaszension in Dezimalgrad, 0–360 (J2000)
 *   dec  Deklination in Dezimalgrad, -90–+90 (J2000)
 *   mag  scheinbare visuelle Helligkeit (kleiner = heller)
 *   hip  Hipparcos-Katalognummer — zur Nachprüfbarkeit mitgeführt
 *
 * UMFANG
 *   Ari  widder        4 Sterne,   3 Linien
 *   Tau  stier        12 Sterne,  10 Linien
 *   Gem  zwillinge    17 Sterne,  16 Linien
 *   Cnc  krebs         5 Sterne,   4 Linien
 *   Leo  loewe        13 Sterne,  16 Linien
 *   Vir  jungfrau     14 Sterne,  14 Linien
 *   Lib  waage         6 Sterne,   6 Linien
 *   Sco  skorpion     18 Sterne,  17 Linien
 *   Sgr  schuetze     14 Sterne,  17 Linien
 *   Cap  steinbock     9 Sterne,   9 Linien
 *   Aqr  wassermann   16 Sterne,  17 Linien
 *   Psc  fische       15 Sterne,  16 Linien
 *   Summe: 143 Sterne, 145 Linien.
 *
 * HINWEIS ZU DEN LINIEN
 *   Stellarium speichert die Figuren als Polylinien, die teilweise auf sich selbst
 *   zurücklaufen (der "Zeichenstift" fährt einen Weg zweimal). Doppelte Kanten
 *   wurden hier entfernt, damit beim SVG-Rendern keine Linie doppelt gestrichelt
 *   bzw. bei Transparenz dunkler gezeichnet wird.
 */

export interface ConstellationStar {
  /** IAU-Eigenname, z.B. 'Antares'. Leerer String, wenn der Stern keinen hat. */
  name: string;
  /** Bayer- bzw. Flamsteed-Bezeichnung, z.B. 'α Sco', 'π¹ Sco', '109 Vir'. */
  bayer: string;
  /** Rektaszension in Dezimalgrad (0–360), Epoche J2000. */
  ra: number;
  /** Deklination in Dezimalgrad (-90–+90), Epoche J2000. */
  dec: number;
  /** Scheinbare visuelle Helligkeit. */
  mag: number;
  /** Hipparcos-Nummer (Quellenbeleg, optional für selbst angelegte Sterne). */
  hip?: number;
}

export interface Constellation {
  key: string;
  latin: string;
  german: string;
  abbr: string;
  stars: ConstellationStar[];
  /** Index-Paare in `stars` — je ein Liniensegment der Strichfigur. */
  lines: [number, number][];
}

export const CONSTELLATIONS: Record<string, Constellation> = {
  // ── ♈  Aries · Widder (Ari) — 4 Sterne, 3 Linien
  // RA 28.4°–42.5°, Dec +19.3°–+27.3°
  widder: {
    key: 'widder',
    latin: 'Aries',
    german: 'Widder',
    abbr: 'Ari',
    stars: [
      { name: 'Mesarthim', bayer: 'γ² Ari', ra: 28.3825, dec: 19.2939, mag: 3.88, hip: 8832 },  // 0
      { name: 'Sheratan', bayer: 'β Ari', ra: 28.66, dec: 20.808, mag: 2.64, hip: 8903 },  // 1
      { name: 'Hamal', bayer: 'α Ari', ra: 31.7933, dec: 23.4624, mag: 2.01, hip: 9884 },  // 2
      { name: 'Bharani', bayer: '41 Ari', ra: 42.4959, dec: 27.2605, mag: 3.61, hip: 13209 },  // 3
    ],
    lines: [
      [0, 1], [1, 2], [2, 3]
    ],
  },

  // ── ♉  Taurus · Stier (Tau) — 12 Sterne, 10 Linien
  // RA 51.2°–84.4°, Dec +0.4°–+28.6°
  stier: {
    key: 'stier',
    latin: 'Taurus',
    german: 'Stier',
    abbr: 'Tau',
    stars: [
      { name: 'Tianguan', bayer: 'ζ Tau', ra: 84.4112, dec: 21.1425, mag: 2.97, hip: 26451 },  // 0
      { name: 'Aldebaran', bayer: 'α Tau', ra: 68.9802, dec: 16.5093, mag: 0.87, hip: 21421 },  // 1
      { name: 'Chamukuy', bayer: 'θ² Tau', ra: 67.1656, dec: 15.8709, mag: 3.4, hip: 20894 },  // 2
      { name: 'Prima Hyadum', bayer: 'γ Tau', ra: 64.9483, dec: 15.6276, mag: 3.65, hip: 20205 },  // 3
      { name: 'Secunda Hyadum', bayer: 'δ¹ Tau', ra: 65.7337, dec: 17.5425, mag: 3.77, hip: 20455 },  // 4
      { name: 'Ain', bayer: 'ε Tau', ra: 67.1541, dec: 19.1804, mag: 3.53, hip: 20889 },  // 5
      { name: 'Elnath', bayer: 'β Tau', ra: 81.573, dec: 28.6075, mag: 1.65, hip: 25428 },  // 6
      { name: '', bayer: 'ξ Tau', ra: 51.7923, dec: 9.7327, mag: 3.73, hip: 16083 },  // 7
      { name: '', bayer: 'ν Tau', ra: 60.7891, dec: 5.9893, mag: 3.91, hip: 18907 },  // 8
      { name: '', bayer: 'ο Tau', ra: 51.2033, dec: 9.0289, mag: 3.61, hip: 15900 },  // 9
      { name: '', bayer: '10 Tau', ra: 54.2183, dec: 0.4017, mag: 4.29, hip: 16852 },  // 10
      { name: '', bayer: 'λ Tau', ra: 60.1701, dec: 12.4903, mag: 3.41, hip: 18724 },  // 11
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [7, 8], [9, 10], [3, 11], [11, 7]
    ],
  },

  // ── ♊  Gemini · Zwillinge (Gem) — 17 Sterne, 16 Linien
  // RA 91.0°–116.3°, Dec +12.9°–+34.0°
  zwillinge: {
    key: 'zwillinge',
    latin: 'Gemini',
    german: 'Zwillinge',
    abbr: 'Gem',
    stars: [
      { name: 'Alzirr', bayer: 'ξ Gem', ra: 101.3224, dec: 12.8956, mag: 3.35, hip: 32362 },  // 0
      { name: '', bayer: 'λ Gem', ra: 109.5232, dec: 16.5404, mag: 3.58, hip: 35350 },  // 1
      { name: 'Wasat', bayer: 'δ Gem', ra: 110.0307, dec: 21.9823, mag: 3.5, hip: 35550 },  // 2
      { name: 'Mekbuda', bayer: 'ζ Gem', ra: 106.0272, dec: 20.5703, mag: 4.01, hip: 34088 },  // 3
      { name: 'Alhena', bayer: 'γ Gem', ra: 99.4279, dec: 16.3993, mag: 1.93, hip: 31681 },  // 4
      { name: '', bayer: 'υ Gem', ra: 113.9806, dec: 26.8957, mag: 4.06, hip: 36962 },  // 5
      { name: '', bayer: 'κ Gem', ra: 116.1119, dec: 24.398, mag: 3.57, hip: 37740 },  // 6
      { name: 'Pollux', bayer: 'β Gem', ra: 116.3292, dec: 28.0262, mag: 1.16, hip: 37826 },  // 7
      { name: '', bayer: 'ι Gem', ra: 111.4317, dec: 27.7981, mag: 3.78, hip: 36046 },  // 8
      { name: '', bayer: 'τ Gem', ra: 107.7849, dec: 30.2452, mag: 4.41, hip: 34693 },  // 9
      { name: 'Castor', bayer: 'α Gem', ra: 113.6495, dec: 31.8883, mag: 1.58, hip: 36850 },  // 10
      { name: '', bayer: 'θ Gem', ra: 103.1972, dec: 33.9613, mag: 3.6, hip: 33018 },  // 11
      { name: 'Mebsuta', bayer: 'ε Gem', ra: 100.983, dec: 25.1311, mag: 3.06, hip: 32246 },  // 12
      { name: '', bayer: 'ν Gem', ra: 97.2408, dec: 20.2121, mag: 4.13, hip: 30883 },  // 13
      { name: 'Tejat', bayer: 'μ Gem', ra: 95.7401, dec: 22.5136, mag: 2.87, hip: 30343 },  // 14
      { name: 'Propus', bayer: 'η Gem', ra: 93.7194, dec: 22.5068, mag: 3.31, hip: 29655 },  // 15
      { name: '', bayer: '1 Gem', ra: 91.0301, dec: 23.2633, mag: 4.16, hip: 28734 },  // 16
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [5, 7], [5, 8], [8, 9], [9, 10], [9, 11],
      [9, 12], [12, 13], [12, 14], [14, 15], [15, 16]
    ],
  },

  // ── ♋  Cancer · Krebs (Cnc) — 5 Sterne, 4 Linien
  // RA 124.1°–134.6°, Dec +9.2°–+28.8°
  krebs: {
    key: 'krebs',
    latin: 'Cancer',
    german: 'Krebs',
    abbr: 'Cnc',
    stars: [
      { name: 'Acubens', bayer: 'α Cnc', ra: 134.6218, dec: 11.8577, mag: 4.26, hip: 44066 },  // 0
      { name: 'Asellus Australis', bayer: 'δ Cnc', ra: 131.1712, dec: 18.1543, mag: 3.94, hip: 42911 },  // 1
      { name: 'Tarf', bayer: 'β Cnc', ra: 124.1288, dec: 9.1855, mag: 3.53, hip: 40526 },  // 2
      { name: 'Asellus Borealis', bayer: 'γ Cnc', ra: 130.8215, dec: 21.4685, mag: 4.66, hip: 42806 },  // 3
      { name: '', bayer: 'ι Cnc', ra: 131.6743, dec: 28.7599, mag: 4.03, hip: 43103 },  // 4
    ],
    lines: [
      [0, 1], [1, 2], [1, 3], [3, 4]
    ],
  },

  // ── ♌  Leo · Löwe (Leo) — 13 Sterne, 16 Linien
  // RA 141.2°–177.3°, Dec +6.0°–+26.2°
  loewe: {
    key: 'loewe',
    latin: 'Leo',
    german: 'Löwe',
    abbr: 'Leo',
    stars: [
      { name: 'Regulus', bayer: 'α Leo', ra: 152.093, dec: 11.9672, mag: 1.36, hip: 49669 },  // 0
      { name: '', bayer: 'η Leo', ra: 151.8331, dec: 16.7627, mag: 3.48, hip: 49583 },  // 1
      { name: 'Algieba', bayer: 'γ¹ Leo', ra: 154.9931, dec: 19.8415, mag: 2.01, hip: 50583 },  // 2
      { name: 'Adhafera', bayer: 'ζ Leo', ra: 154.1726, dec: 23.4173, mag: 3.43, hip: 50335 },  // 3
      { name: 'Rasalas', bayer: 'μ Leo', ra: 148.191, dec: 26.007, mag: 3.88, hip: 48455 },  // 4
      { name: 'Ras Elased Australis', bayer: 'ε Leo', ra: 146.4628, dec: 23.7743, mag: 2.97, hip: 47908 },  // 5
      { name: 'Zosma', bayer: 'δ Leo', ra: 168.5271, dec: 20.5237, mag: 2.56, hip: 54872 },  // 6
      { name: 'Denebola', bayer: 'β Leo', ra: 177.2649, dec: 14.5721, mag: 2.14, hip: 57632 },  // 7
      { name: 'Chertan', bayer: 'θ Leo', ra: 168.56, dec: 15.4296, mag: 3.33, hip: 54879 },  // 8
      { name: '', bayer: 'κ Leo', ra: 141.1636, dec: 26.1823, mag: 4.47, hip: 46146 },  // 9
      { name: 'Alterf', bayer: 'λ Leo', ra: 142.9301, dec: 22.968, mag: 4.32, hip: 46750 },  // 10
      { name: '', bayer: 'ι Leo', ra: 170.981, dec: 10.5295, mag: 4.0, hip: 55642 },  // 11
      { name: '', bayer: 'σ Leo', ra: 170.2841, dec: 6.0293, mag: 4.05, hip: 55434 },  // 12
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 7], [7, 8], [8, 6], [8, 1], [4, 9],
      [9, 10], [10, 5], [5, 1], [8, 11], [11, 12]
    ],
  },

  // ── ♍  Virgo · Jungfrau (Vir) — 14 Sterne, 14 Linien
  // RA 176.5°–221.6°, Dec -11.2°–+11.0°
  jungfrau: {
    key: 'jungfrau',
    latin: 'Virgo',
    german: 'Jungfrau',
    abbr: 'Vir',
    stars: [
      { name: 'Zaniah', bayer: 'η Vir', ra: 184.9765, dec: -0.6668, mag: 3.89, hip: 60129 },  // 0
      { name: '', bayer: 'ο Vir', ra: 181.3023, dec: 8.733, mag: 4.12, hip: 58948 },  // 1
      { name: '', bayer: 'ν Vir', ra: 176.4648, dec: 6.5294, mag: 4.04, hip: 57380 },  // 2
      { name: 'Zavijava', bayer: 'β Vir', ra: 177.6738, dec: 1.7647, mag: 3.59, hip: 57757 },  // 3
      { name: 'Porrima', bayer: 'γ Vir', ra: 190.4152, dec: -1.4494, mag: 2.74, hip: 61941 },  // 4
      { name: 'Minelauva', bayer: 'δ Vir', ra: 193.9009, dec: 3.3975, mag: 3.39, hip: 63090 },  // 5
      { name: 'Vindemiatrix', bayer: 'ε Vir', ra: 195.5442, dec: 10.9591, mag: 2.85, hip: 63608 },  // 6
      { name: '', bayer: 'θ Vir', ra: 197.4875, dec: -5.539, mag: 4.38, hip: 64238 },  // 7
      { name: 'Spica', bayer: 'α Vir', ra: 201.2982, dec: -11.1613, mag: 0.98, hip: 65474 },  // 8
      { name: 'Heze', bayer: 'ζ Vir', ra: 203.6733, dec: -0.5958, mag: 3.38, hip: 66249 },  // 9
      { name: '', bayer: 'τ Vir', ra: 210.4116, dec: 1.5445, mag: 4.23, hip: 68520 },  // 10
      { name: '', bayer: '109 Vir', ra: 221.5622, dec: 1.8929, mag: 3.73, hip: 72220 },  // 11
      { name: 'Syrma', bayer: 'ι Vir', ra: 214.0036, dec: -6.0005, mag: 4.07, hip: 69701 },  // 12
      { name: '', bayer: 'μ Vir', ra: 220.7651, dec: -5.6582, mag: 3.87, hip: 71957 },  // 13
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 5], [5, 6], [4, 7], [7, 8], [4, 9], [9, 10],
      [10, 11], [9, 12], [12, 13]
    ],
  },

  // ── ♎  Libra · Waage (Lib) — 6 Sterne, 6 Linien
  // RA 222.7°–234.7°, Dec -29.8°–-9.4°
  waage: {
    key: 'waage',
    latin: 'Libra',
    german: 'Waage',
    abbr: 'Lib',
    stars: [
      { name: 'Zubenelgenubi', bayer: 'α² Lib', ra: 222.7197, dec: -16.0418, mag: 2.75, hip: 72622 },  // 0
      { name: 'Zubeneschamali', bayer: 'β Lib', ra: 229.2517, dec: -9.3829, mag: 2.61, hip: 74785 },  // 1
      { name: 'Brachium', bayer: 'σ Lib', ra: 226.0176, dec: -25.282, mag: 3.25, hip: 73714 },  // 2
      { name: 'Zubenelhakrabi', bayer: 'γ Lib', ra: 233.8816, dec: -14.7895, mag: 3.91, hip: 76333 },  // 3
      { name: '', bayer: 'υ Lib', ra: 234.256, dec: -28.1351, mag: 3.6, hip: 76470 },  // 4
      { name: '', bayer: 'τ Lib', ra: 234.6641, dec: -29.7778, mag: 3.66, hip: 76600 },  // 5
    ],
    lines: [
      [0, 1], [0, 2], [1, 3], [3, 0], [3, 4], [4, 5]
    ],
  },

  // ── ♏  Scorpius · Skorpion (Sco) — 18 Sterne, 17 Linien
  // RA 239.2°–267.5°, Dec -43.2°–-19.5°
  skorpion: {
    key: 'skorpion',
    latin: 'Scorpius',
    german: 'Skorpion',
    abbr: 'Sco',
    stars: [
      { name: 'Acrab', bayer: 'β¹ Sco', ra: 241.3593, dec: -19.8055, mag: 2.56, hip: 78820 },  // 0
      { name: 'Dschubba', bayer: 'δ Sco', ra: 240.0834, dec: -22.6217, mag: 2.29, hip: 78401 },  // 1
      { name: 'Fang', bayer: 'π Sco', ra: 239.713, dec: -26.1141, mag: 2.89, hip: 78265 },  // 2
      { name: 'Alniyat', bayer: 'σ Sco', ra: 245.2971, dec: -25.5928, mag: 2.9, hip: 80112 },  // 3
      { name: 'Antares', bayer: 'α Sco', ra: 247.3519, dec: -26.432, mag: 1.06, hip: 80763 },  // 4
      { name: 'Paikauhale', bayer: 'τ Sco', ra: 248.9706, dec: -28.216, mag: 2.82, hip: 81266 },  // 5
      { name: 'Larawag', bayer: 'ε Sco', ra: 252.5412, dec: -34.2932, mag: 2.29, hip: 82396 },  // 6
      { name: 'Xamidimura', bayer: 'μ¹ Sco', ra: 252.9676, dec: -38.0474, mag: 3.0, hip: 82514 },  // 7
      { name: '', bayer: 'ζ² Sco', ra: 253.646, dec: -42.3613, mag: 3.62, hip: 82729 },  // 8
      { name: '', bayer: 'η Sco', ra: 258.0383, dec: -43.2392, mag: 3.32, hip: 84143 },  // 9
      { name: 'Sargas', bayer: 'θ Sco', ra: 264.3297, dec: -42.9978, mag: 1.86, hip: 86228 },  // 10
      { name: '', bayer: 'ι¹ Sco', ra: 266.8962, dec: -40.127, mag: 2.99, hip: 87073 },  // 11
      { name: '', bayer: 'κ Sco', ra: 265.622, dec: -39.03, mag: 2.39, hip: 86670 },  // 12
      { name: 'Lesath', bayer: 'υ Sco', ra: 262.691, dec: -37.2958, mag: 2.7, hip: 85696 },  // 13
      { name: 'Shaula', bayer: 'λ Sco', ra: 263.4022, dec: -37.1038, mag: 1.62, hip: 85927 },  // 14
      { name: 'Fuyue', bayer: 'G Sco', ra: 267.4645, dec: -37.0433, mag: 3.19, hip: 87261 },  // 15
      { name: 'Jabbah', bayer: 'ν Sco', ra: 242.9989, dec: -19.4607, mag: 4.0, hip: 79374 },  // 16
      { name: 'Iklil', bayer: 'ρ Sco', ra: 239.2212, dec: -29.2141, mag: 3.87, hip: 78104 },  // 17
    ],
    lines: [
      [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
      [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [0, 16], [2, 17]
    ],
  },

  // ── ♐  Sagittarius · Schütze (Sgr) — 14 Sterne, 17 Linien
  // RA 271.5°–290.4°, Dec -36.8°–-17.8°
  schuetze: {
    key: 'schuetze',
    latin: 'Sagittarius',
    german: 'Schütze',
    abbr: 'Sgr',
    stars: [
      { name: 'Kaus Australis', bayer: 'ε Sgr', ra: 276.043, dec: -34.3846, mag: 1.79, hip: 90185 },  // 0
      { name: 'Alnasl', bayer: 'γ² Sgr', ra: 271.452, dec: -30.4241, mag: 2.98, hip: 88635 },  // 1
      { name: 'Kaus Media', bayer: 'δ Sgr', ra: 275.2485, dec: -29.8281, mag: 2.72, hip: 89931 },  // 2
      { name: 'Kaus Borealis', bayer: 'λ Sgr', ra: 276.9927, dec: -25.4217, mag: 2.82, hip: 90496 },  // 3
      { name: '', bayer: 'φ Sgr', ra: 281.4141, dec: -26.9908, mag: 3.17, hip: 92041 },  // 4
      { name: 'Nunki', bayer: 'σ Sgr', ra: 283.8163, dec: -26.2967, mag: 2.05, hip: 92855 },  // 5
      { name: '', bayer: 'τ Sgr', ra: 286.7351, dec: -27.6704, mag: 3.32, hip: 93864 },  // 6
      { name: 'Ascella', bayer: 'ζ Sgr', ra: 285.653, dec: -29.8801, mag: 2.6, hip: 93506 },  // 7
      { name: '', bayer: 'η Sgr', ra: 274.4069, dec: -36.7617, mag: 3.1, hip: 89642 },  // 8
      { name: 'Polis', bayer: 'μ Sgr', ra: 273.4409, dec: -21.0588, mag: 3.84, hip: 89341 },  // 9
      { name: '', bayer: 'ρ¹ Sgr', ra: 290.4182, dec: -17.8472, mag: 3.92, hip: 95168 },  // 10
      { name: 'Albaldah', bayer: 'π Sgr', ra: 287.441, dec: -21.0236, mag: 2.88, hip: 94141 },  // 11
      { name: '', bayer: 'ο Sgr', ra: 286.1707, dec: -21.7415, mag: 3.76, hip: 93683 },  // 12
      { name: '', bayer: 'ξ² Sgr', ra: 284.4325, dec: -21.1067, mag: 3.52, hip: 93085 },  // 13
    ],
    lines: [
      [0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2], [4, 5], [5, 6], [6, 7], [7, 4], [7, 0],
      [0, 8], [3, 9], [10, 11], [11, 12], [12, 13], [13, 11]
    ],
  },

  // ── ♑  Capricornus · Steinbock (Cap) — 9 Sterne, 9 Linien
  // RA 304.5°–326.8°, Dec -26.9°–-12.5°
  steinbock: {
    key: 'steinbock',
    latin: 'Capricornus',
    german: 'Steinbock',
    abbr: 'Cap',
    stars: [
      { name: 'Algedi', bayer: 'α² Cap', ra: 304.5136, dec: -12.5449, mag: 3.58, hip: 100064 },  // 0
      { name: 'Dabih', bayer: 'β Cap', ra: 305.2528, dec: -14.7814, mag: 3.05, hip: 100345 },  // 1
      { name: '', bayer: 'ψ Cap', ra: 311.5239, dec: -25.2709, mag: 4.13, hip: 102485 },  // 2
      { name: '', bayer: 'ω Cap', ra: 312.9554, dec: -26.9191, mag: 4.12, hip: 102978 },  // 3
      { name: '', bayer: 'ζ Cap', ra: 321.6668, dec: -22.4113, mag: 3.77, hip: 105881 },  // 4
      { name: '', bayer: 'ε Cap', ra: 324.2701, dec: -19.466, mag: 4.51, hip: 106723 },  // 5
      { name: 'Deneb Algedi', bayer: 'δ Cap', ra: 326.7602, dec: -16.1273, mag: 2.85, hip: 107556 },  // 6
      { name: 'Nashira', bayer: 'γ Cap', ra: 325.0227, dec: -16.6623, mag: 3.69, hip: 106985 },  // 7
      { name: '', bayer: 'θ Cap', ra: 316.4868, dec: -17.2329, mag: 4.08, hip: 104139 },  // 8
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 0]
    ],
  },

  // ── ♒  Aquarius · Wassermann (Aqr) — 16 Sterne, 17 Linien
  // RA 311.9°–350.7°, Dec -21.2°–+1.4°
  wassermann: {
    key: 'wassermann',
    latin: 'Aquarius',
    german: 'Wassermann',
    abbr: 'Aqr',
    stars: [
      { name: 'Albali', bayer: 'ε Aqr', ra: 311.919, dec: -9.4958, mag: 3.78, hip: 102618 },  // 0
      { name: 'Sadalsuud', bayer: 'β Aqr', ra: 322.8897, dec: -5.5712, mag: 2.9, hip: 106278 },  // 1
      { name: 'Sadalmelik', bayer: 'α Aqr', ra: 331.446, dec: -0.3199, mag: 2.95, hip: 109074 },  // 2
      { name: 'Sadachbia', bayer: 'γ Aqr', ra: 335.4141, dec: -1.3873, mag: 3.86, hip: 110395 },  // 3
      { name: '', bayer: 'ζ¹ Aqr', ra: 337.208, dec: -0.02, mag: 3.65, hip: 110960 },  // 4
      { name: '', bayer: 'η Aqr', ra: 338.8391, dec: -0.1175, mag: 4.04, hip: 111497 },  // 5
      { name: '', bayer: 'π Aqr', ra: 336.3193, dec: 1.3774, mag: 4.8, hip: 110672 },  // 6
      { name: '', bayer: 'ι Aqr', ra: 331.6093, dec: -13.8697, mag: 4.29, hip: 109139 },  // 7
      { name: 'Ancha', bayer: 'θ Aqr', ra: 334.2085, dec: -7.7833, mag: 4.17, hip: 110003 },  // 8
      { name: '', bayer: 'λ Aqr', ra: 343.1536, dec: -7.5796, mag: 3.73, hip: 112961 },  // 9
      { name: '', bayer: 'φ Aqr', ra: 348.5807, dec: -6.049, mag: 4.22, hip: 114724 },  // 10
      { name: '', bayer: 'ψ² Aqr', ra: 349.4759, dec: -9.1825, mag: 4.41, hip: 115033 },  // 11
      { name: '', bayer: '98 Aqr', ra: 350.7426, dec: -20.1006, mag: 3.96, hip: 115438 },  // 12
      { name: '', bayer: '88 Aqr', ra: 347.3616, dec: -21.1724, mag: 3.68, hip: 114341 },  // 13
      { name: 'Skat', bayer: 'δ Aqr', ra: 343.6626, dec: -15.8208, mag: 3.27, hip: 113136 },  // 14
      { name: '', bayer: 'τ² Aqr', ra: 342.3979, dec: -13.5926, mag: 4.05, hip: 112716 },  // 15
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 2], [7, 1], [2, 8], [8, 9], [9, 10],
      [10, 11], [11, 12], [11, 13], [11, 14], [14, 15], [15, 9]
    ],
  },

  // ── ♓  Pisces · Fische (Psc) — 15 Sterne, 16 Linien
  // RA 12.2°–359.8°, Dec +1.3°–+30.1°
  // ACHTUNG: Pisces überschreitet RA 0h — die Rektaszensionen laufen von ~350°
  // zurück auf ~0–30°. Beim Zeichnen entweder alle RA < 180 um +360 erhöhen
  // oder relativ zu einem Referenzstern entfalten, sonst zerreißt die Figur.
  fische: {
    key: 'fische',
    latin: 'Pisces',
    german: 'Fische',
    abbr: 'Psc',
    stars: [
      { name: '', bayer: 'φ Psc', ra: 18.4373, dec: 24.5837, mag: 4.67, hip: 5742 },  // 0
      { name: '', bayer: 'υ Psc', ra: 19.8666, dec: 27.2641, mag: 4.74, hip: 6193 },  // 1
      { name: '', bayer: 'τ Psc', ra: 17.9151, dec: 30.0896, mag: 4.51, hip: 5586 },  // 2
      { name: 'Alpherg', bayer: 'η Psc', ra: 22.8709, dec: 15.3458, mag: 3.62, hip: 7097 },  // 3
      { name: 'Torcular', bayer: 'ο Psc', ra: 26.3485, dec: 9.1577, mag: 4.26, hip: 8198 },  // 4
      { name: 'Alrescha', bayer: 'α Psc', ra: 30.5118, dec: 2.7638, mag: 3.82, hip: 9487 },  // 5
      { name: '', bayer: 'ν Psc', ra: 25.3579, dec: 5.4876, mag: 4.45, hip: 7884 },  // 6
      { name: '', bayer: 'ε Psc', ra: 15.7359, dec: 7.8901, mag: 4.27, hip: 4906 },  // 7
      { name: '', bayer: 'δ Psc', ra: 12.1706, dec: 7.5851, mag: 4.44, hip: 3786 },  // 8
      { name: '', bayer: 'ω Psc', ra: 359.8279, dec: 6.8633, mag: 4.03, hip: 118268 },  // 9
      { name: '', bayer: 'ι Psc', ra: 354.9877, dec: 5.6263, mag: 4.13, hip: 116771 },  // 10
      { name: '', bayer: 'θ Psc', ra: 351.9921, dec: 6.379, mag: 4.27, hip: 115830 },  // 11
      { name: '', bayer: 'γ Psc', ra: 349.2914, dec: 3.2823, mag: 3.7, hip: 114971 },  // 12
      { name: '', bayer: 'κ Psc', ra: 351.7331, dec: 1.2556, mag: 4.95, hip: 115738 },  // 13
      { name: '', bayer: 'λ Psc', ra: 355.5117, dec: 1.78, mag: 4.49, hip: 116928 },  // 14
    ],
    lines: [
      [0, 1], [1, 2], [2, 0], [0, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
      [10, 11], [11, 12], [12, 13], [13, 14], [14, 10]
    ],
  },
};
