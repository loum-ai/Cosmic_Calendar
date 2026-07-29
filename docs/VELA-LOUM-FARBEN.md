---
name: Vela auf loums Farbwelt
description: Zuordnung aller bedeutungstragenden Vela-Farben auf loums v6-Rampen, plus die zweite Unterscheidungsachse
type: design
date: 2026-07-29
status: Entwurf
---

# Vela auf loums Farbwelt

## Warum es heute nicht nach loum aussieht

Auf einem Vela-Bildschirm liegen 33 verschiedene Farben, nur 4 davon stehen in loums v6-SSOT; die beiden häufigsten sind `#AA5CFF` (20x) und `#FFCE6E` (19x) und existieren in v6 nicht. Im `src/` stehen 487 fest verdrahtete Hex-Werte, 108 verschiedene, davon 94 ausserhalb von v6. Cinzel Decorative — loums Signatur-Schrift mit Halo — ist auf der Seite null mal im Einsatz, ausser in der 11px-Wortmarke, wo der em-relative Glow 1,76px misst und unsichtbar bleibt.

## Die Zuordnung

Regel: **Farbe kodiert die Gruppe, nicht den einzelnen Planeten.** Gemessen an v6 (Grün und Pink gestrichen) sind in der Violett-Familie nur 4 Töne bei ΔE ≥ 15 zu trennen, nicht 13. Zweite Achse ist das **Glyph** — es wird in `src/components/ChartWheel.tsx:200,217` bereits gerendert, die Farbe liegt heute redundant obendrauf. Dritte Achse: **gefüllt vs. offener Ring**.

| Was | heute | neu | Rampe/Token | Begründung |
|---|---|---|---|---|
| Sonne | `#ffce6e` | `#E8E5F2` | `--moon-300` | persönlich · gefüllt · CR 15,22:1 |
| Mond | `#d7e3ff` | `#E8E5F2` | `--moon-300` | persönlich · gefüllt |
| Merkur | `#8fd0e6` | `#E8E5F2` | `--moon-300` | persönlich · gefüllt |
| Venus | `#46e8c4` | `#E8E5F2` | `--moon-300` | persönlich · gefüllt · Grün raus |
| Mars | `#ff6a52` | `#E8E5F2` | `--moon-300` | persönlich · gefüllt |
| Jupiter | `#ffce5e` | `#A78BFA` | `--aura-400` | sozial · gefüllt · war ΔE 2,3 zur Sonne |
| Saturn | `#cda6ff` | `#A78BFA` | `--aura-400` | sozial · gefüllt |
| Uranus | `#79e6d6` | `#72C4FF` | `--celestial-300` | transpersonal · gefüllt · Grün raus |
| Neptun | `#9db6ff` | `#72C4FF` | `--celestial-300` | transpersonal · gefüllt |
| Pluto | `#d39aea` | `#72C4FF` | `--celestial-300` | transpersonal · gefüllt |
| Chiron | `#8fd0ff` | `#DA8FFF` | `--orchid-400` | Punkt · offener Ring 1,5px |
| Lilith | `#e3a8d6` | `#DA8FFF` | `--orchid-400` | Punkt · offener Ring · Pink raus |
| AC | `#c9b6ff` | `#DA8FFF` | `--orchid-400` | Punkt · offener Ring · war ΔE 0,9 zum Fallback |
| Fallback | `#cbb9ff` | `#ABABBC` | `--void-300` | unbekannt = neutral, nie Violett |

Kleinster Abstand im Vierer: ΔE 15,1 (moon-300 / celestial-300). Alle vier über der Schwelle, auch unter Deuteranopie.

**Elemente — Helligkeitsleiter in einer Rampe.** Sie stehen als beschriftete Balken, nie neben Planeten.

| Was | heute | neu | Rampe/Token | Begründung |
|---|---|---|---|---|
| Feuer | `#ff6a52` | `#F3EEFF` | `--aura-50` | CR 16,62:1 |
| Erde | `#46e8c4` | `#D4C8FF` | `--aura-200` | ΔE 13,7 zum Nachbarn |
| Luft | `#8fd0e6` | `#A78BFA` | `--aura-400` | ΔE 17,2 |
| Wasser | `#9db6ff` | `#6E52D8` | `--aura-600` | ΔE 19,4 · CR 3,47:1, letzte tragfähige Stufe |

**Modalitäten — eigene Rampe, damit die zwei Balkenblöcke sich nicht mischen.**

| Was | heute | neu | Rampe/Token | Begründung |
|---|---|---|---|---|
| kardinal | `#cda6ff` | `#F5C5FF` | `--orchid-200` | CR 12,87:1 |
| fix | `#ffce6e` | `#DA8FFF` | `--orchid-400` | CR 8,41:1 · Gelb raus |
| veränderlich | `#79e6d6` | `#A840D8` | `--orchid-600` | CR 3,95:1 · Grün raus |

**Aspekte — 2 Farben statt 5.** Fluss gegen Spannung, wie astro.com seit Jahrzehnten. Der Typ kommt über das Glyph `g` und die Strichart; beides liegt in `src/lib/data.ts:150-154` bereits im Datenmodell und wird nicht gerendert.

| Was | heute | neu | Rampe/Token | Begründung |
|---|---|---|---|---|
| Konjunktion | `#e7dcff` | `#E8E5F2` | `--moon-300` | neutral · durchgezogen · `w 1.2` → 1,8px |
| Sextil | `#5599FF` | `#72C4FF` | `--celestial-300` | Fluss · gestrichelt 4/2 · Glyph ⚹ |
| Trigon | `#20F0D0` | `#72C4FF` | `--celestial-300` | Fluss · durchgezogen · Glyph △ · Grün raus |
| Quadrat | `#aa5cff` | `#DA8FFF` | `--orchid-400` | Spannung · durchgezogen · Glyph □ |
| Opposition | `#ff8fb0` | `#DA8FFF` | `--orchid-400` | Spannung · gestrichelt 6/3 · Pink raus |

## Was Farbe allein nicht leisten darf

Alle fünf Aspektlinien reissen heute WCAG 2.2 SC 1.4.11 (3:1). `src/components/ChartWheel.tsx:182` setzt `strokeOpacity={0.28}`; gerendert auf `#111019` ergibt das 1,44:1 bis 2,17:1. Gemessene Mindestdeckkraft für 3:1: moon-300 0,37 · celestial-300 0,47 · orchid-400 0,51. **Bodenwert 0,55 für alle nicht gewählten Linien.**

SC 1.4.1 (Level A) verlangt einen zweiten Kanal. Vela hat ihn bei Planeten (Glyph), bei Linien nicht. Er kommt dazu als: Glyph aus `data.ts` `g`, Strichart, und Strichstärke aus `data.ts` `w` — der Wert existiert und wird in `ChartWheel.tsx:183` ignoriert. Balken und Flächen brauchen ihr Label.

## Die drei Änderungen mit der grössten Wirkung

1. **Einen Display-Moment bauen.** `src/screens/ChartExplorer.tsx:329-334`, ein Wort der Signatur-Zeile in `.vela-oracle-head` (`src/index.css:307`, Cinzel Decorative, clamp 28–44px, `--glow-lit`). Die Klasse ist fertig und hat 0 Verwendungen. loum hat zwei solche Momente bei 39px und 44px, Vela keinen.
2. **Die Grössenleiter auf fünf Stufen kürzen.** Heute 27 Grössen auf einem Screen, Faktor 2,47, zwölf Zwischenstufen zwischen 15 und 37px. Ziel: `clamp(38,6vw,64)` / `clamp(28,3.4vw,40)` / 21 / 15 / 12,5 — Faktor 4,3. Grösse wird vor Farbe gelesen, das wirkt also zuerst.
3. **Sektionsköpfe auf loum-Muster.** `ChartExplorer.tsx:647-660`: Nummer in Akzentfarbe plus Eyebrow **über** die Überschrift, Überschrift auf 22ch gekappt, Sektionsabstand 64 → 112px, Kopf → Inhalt 24 → 48px. Das Muster steht schon in `src/screens/ThemenHub.tsx:1008`, nur nicht im ChartExplorer.

## Reihenfolge

| # | Schritt | Hängt an | Warum hier |
|---|---|---|---|
| 1 | Aspektlinien: 2 Farben, Deckkraft 0,55, `w` und `g` rendern | — | Rechtsrisiko, nicht Geschmack |
| 2 | Zwei Sofortfixes: Jupiter = Sonne, AC = Fallback | — | Bugs, eine Zeile |
| 3 | Planeten auf 4 Gruppen + gefüllt/offen | 1 | löst 35 kaputte Paare |
| 4 | `PCOL`/`COL`/`tokens.ts`/`PrintView` auf eine Quelle | 3 | 5 konkurrierende Paletten, im Druck 2× ΔE 0,0 |
| 5 | Elemente und Modalitäten auf die Leitern | 3 | braucht die Labels aus 3 |
| 6 | Typografie 1–3 | — | parallel möglich, unabhängig von Farbe |
| 7 | Dekoration: Karten-Verlauf 10× dedupliziert, 39 Tippfehler-Hex raus | 5 | reine Aufräumarbeit |
