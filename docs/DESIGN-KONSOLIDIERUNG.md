# vela — Konsolidierte Design-Richtung & Repo-Stand

Stand: 2026-07-22, Repo `/Users/laura/Documents/GitHub/cosmic-calendar`, HEAD `1a4515c` (main, working tree clean).

---

## 1. Konsolidierte Design-Richtung

**Die eine Richtung: „Mystic Luxury / Cosmic Night" auf dem Fundament QUINTESSENCE v6.** Das Moodboard (Inspiration/Moodboard@2x.png) gewichtet klar die dunkle Cosmic-Night-Ästhetik; die S/W-Editorial- und Pastell-Referenzen sind bewusste Kontrast-Optionen, keine Hauptrichtung. Das im Code existierende v6-System deckt diese Richtung bereits ab — es wird **beibehalten und verfeinert, nicht ersetzt**.

### Was bleibt (das v6-System, im Code verifiziert)

- **Canvas & Farben:** `space #111019`, `space-2 #1A1829`, Text `bone #F8F7F2`; Akzente `aura/violet #A78BFA` (primär), `mystic #20F0D0` (punktueller Puls), `lilac #BBA8FF` (Rim-Lights), `azure #5599FF` (Dialog/KI); semantische Flächen/Linien/Text als Tokens; Planet- und Aspekt-Farben (`tailwind.config.ts:14-61`). CSS-Variablen als SSOT inkl. shadcn-HSL-Bridge (`src/index.css:7-55`, Kommentar „SSOT: loum Design System" Z. 30).
- **Karten-Chemie:** SOLIDE dunkle Karten (`--surface-card` Gradient #16161F→#12121D), einzige Kante = 1px-Inset-Hairline 7% weiß, **kein** Drop-Shadow, **kein** backdrop-blur — einzige Blur-Fläche ist die Askbar (blur 16px); „Tiefe kommt von INNEN" via radiale Glows; Grain deaktiviert (`src/index.css:214-270, 350-373, 440-443`; Kapselung: `src/components/GlassPanel.tsx:15-33`).
- **Typografie „Two Faces":** Cinzel = Display uppercase flach ohne Glow; Cinzel Decorative = nur die Wordmark, der EINZIGE Glow-Träger (`--glow-lit`); Bricolage Grotesque = alles andere; Noto Sans Symbols für Glyphen; Text trägt NIE einen Verlauf (`tailwind.config.ts:63-73`, `src/index.css:93-212`).
- **Moon-CTA:** weiße Fläche, dunkler Text, Radius fix 19px („NIE pill"), weicher Iris-Schatten (`src/index.css:244-260`); `bg-cta-gradient` (azure→violett) nur für KI/Dialog-Flächen und Brand-Mark (`tailwind.config.ts:88-96`).
- **Layout-Garantien:** ScreenShell erzwingt Max-Width/Padding/Slide-Transitions für jeden Screen (`src/components/ScreenShell.tsx:12-64`); 5-Tab-Navigation via Glass-Pill/Rail (`src/components/TabBar.tsx:6-76`); AuroraBackground als atmosphärischer Grund (`src/components/AuroraBackground.tsx:8-23`).
- **Regeln:** die 7 kanonischen Prinzipien, insbesondere §5 (Bedeutung zuerst, Fachbegriff als Eyebrow), §6 (geerdet, nicht esoterisch) und §7 (Chart IMMER sichtbar, Rad = erstes Inhaltselement der Home, Playwright-Screenshot-Check vor Merge) — `docs/PRINZIPIEN.md:9-73`.

### Was aus den Moodboard-Experimenten in die Richtung einfließt

- **Typo-Bestätigung:** Die über alle Referenzen wiederkehrende Dreier-Hierarchie (Serif-Display + Sans-Body + Smallcaps-Microcopy) ist exakt das, was v6 mit `.vela-hero`/`.vela-body`/`.vela-label` (letter-spacing 0.18em caps) schon tut — die Experimente validieren das System, statt es zu ändern.
- **Layout-Korrektur:** Das Muster-Inventar der Referenzen ist **vertikales Karten-Scrolling mit radialen Akzenten** (Chart-Rad, Ring-Elemente, Sign-Slider) — echtes Bento kommt nur in der Pastell-Variante andeutungsweise vor. Das stützt Lauras offenen Befund, dass die 4er-Bento-Section aus PR #97 loum.ai-Content ist (siehe Abschnitt 3).
- **Tempo/Interaktion:** langsam, zeremoniell, eine Aktion pro Screen, viel Negativraum (Press-and-hold-Referenz) — passt zu den vorhandenen Motion-Tokens (breath, float, EASE.smooth in `src/lib/tokens.ts:35-38`).
- **Poster-Ästhetik als Ausnahme-Fläche:** Die Gold-Champagner-Serifen und barocken Kreaturen (CODEX-Karten) werden NICHT ins UI-System übernommen, sondern nur für generierte **Sign-Poster** nach der Moodboard-Formel reserviert (Illustration + Starfield + Typo-Stack).

### Was explizit NICHT übernommen wird

- **Glassmorphism** der Dribbble-Referenzen (halbtransparente Blur-Karten) — v6 verbietet Glas auf Karten ausdrücklich (`src/index.css:217-229`).
- **Prozent-Ringe pro Lebensbereich** (Love/Career/Health-Gauges) — kollidiert mit §1 „Kein Lebensthema ist bevorzugt" und §6 (`docs/PRINZIPIEN.md`).
- **Phone-Frame** (in den synth-Screenshots noch sichtbar) — laut Audit verworfen (`AUDIT.md`, Punkt 5).
- **Emoji-Bullets** der Pastell-Referenz — Audit-Punkt 7 verlangt Glyphen per Symbol-Font (`AUDIT.md`).

---

## 2. Punkte aus den Experimenten

Konkret übernehmbar, je mit Quelle:

1. **Aufklappbare Aspekt-Chips/Labels** („Pluto, Mars, 4. Haus, Lilith Konjunktion Sonne Fisch") — das einzige eigene Moodboard-Artefakt dokumentiert diese Feature-Absicht als deutsche Notiz; passt exakt zu §3/§5 (Progressive Disclosure, Fachbegriff als Eyebrow). *Quelle: Inspiration/Moodboard@2x.png (Annotation).*
2. **Sign-Poster-Pipeline:** Formel „Zodiac-Illustration + Starfield-Grafik = eigenes Sign-Poster" mit der CODEX-Karten-Anatomie als Struktur (NAME / Element·Modalität·Planet in Smallcaps / Beiname / Eigenschaften). *Quellen: Moodboard@2x.png (rechte Bildgruppe, annotierte Formel); Inspiration/Bildschirmfoto 2026-07-22 um 14.28.50.png.*
3. **Zeit-Tabs für Transite** (Today/Tomorrow/Weekly bzw. Gestern/Heute/Morgen) als Segmented-Pill — natürliche Erweiterung des TransiteScreen-Musters (`src/screens/TransiteScreen.tsx:124-208`). *Quellen: Bildschirmfoto 14.25.25.png, 14.27.31.png, 14.29.09.png.*
4. **Zodiac-Glyphen-Slider** (horizontal, gepunkteter Kreis um das aktive Zeichen) — mit Glyphen aus Noto Sans Symbols statt Emojis (Audit-Punkt 7). *Quelle: Bildschirmfoto 14.25.25.png.*
5. **Beziehungs-Farbcode am Rad** („fließt / Chance / Spannung / Balance / vereint") mit Klartext-Legende „So liest du dein Rad" — deckungsgleich mit den existierenden Aspekt-Farb-Tokens (`tailwind.config.ts:55-61`). *Quelle: screenshots/synth1.png, synth2.png (eigenes, älteres Design-Experiment).*
6. **Klartext-Karte „Kurz gesagt"** als Einstieg der Chart-Deutung (Sternzeichen + Aszendent in einem Satz erklärt) — direkte Umsetzung von §5. *Quelle: screenshots/synthglyphs.png.*
7. **Modus-abhängige Aurora-Akzentfärbung** (Blau/Violett, Magenta, Mint je nach Kontext) — abbildbar mit den vorhandenen Akzent-Tokens aura/mystic/azure auf dem AuroraBackground. *Quelle: Bildschirmfoto 14.29.09.png (Press-and-hold-Konzept).*
8. **Zeremonielles Interaktions-Tempo:** eine Primäraktion pro Screen, Ritual-Gesten (Press-and-hold), viel Negativraum. *Quelle: Bildschirmfoto 14.29.09.png, übergreifend Moodboard@2x.png.*
9. **Vertikales Karten-Scrolling mit radialen Akzenten statt Bento** als Home-Layoutsprache. *Quelle: übergreifend Bildschirmfoto 14.25.18.png, 14.27.48.png, 14.29.09.png.*

Einordnung: Alle 19 Screenshots und beide .webp in `Inspiration/` sind Fremd-Inspiration (Dribbble/Behance/Produkt-Shots); einziges eigenes Artefakt ist das Moodboard selbst. Die synth-Screenshots in `screenshots/` sind ein eigener, aber verworfener Design-Stand (Phone-Frame, 4-Tab-Nav — widerspricht Audit und README).

---

## 3. Offene Deltas

**Was noch nicht auf main ist bzw. offen steht:**

1. **Branch `origin/claude/vela-design-impl-nbuip2`: inhaltlich zu 100 % in main, kann weg.** Verifiziert per Blob-Vergleich: der einzige Branch-Commit `c16fd1f` wurde als PR #98 squash-gemerged (main-Commit `0299226`); alle drei Dateien sind blob-identisch (`docs/PRINZIPIEN.md`=1d6f36d, `src/components/TabBar.tsx`=aaa879f, `src/screens/ThemenHub.tsx`=2dfc320). Der Drei-Punkte-Diff (`git diff main...branch`) täuscht Neues vor, weil er gegen die Merge-Base `fafa367` diffed; der Direkt-Diff zeigt als einzigen Unterschied die `.gitignore`, bei der der Branch **hinter** main zurückliegt. Empfehlung: löschen — es ist ein Squash-Merge-Überbleibsel.
2. **Branch `web-export-archiv`: nur lokal, nicht gepusht.** *(Unverifiziert, aus git-Ausgaben der Recherche:)* Tip `1baa51e` ist direkter Vorfahr von main, keine Commits jenseits von main — ein reiner Sicherungs-Zeiger auf den Stand vor der Web-Export-Entfernung (`1a4515c`). Auf origin existieren nur `main` und `claude/vela-design-impl-nbuip2` — bei Verlust des lokalen Ordners wäre das archivierte Material weg.
3. **Lokale Artefakte (bewusst unversioniert, kein Cruft):** `vela.dc.html` (claude.ai-Artefakt-Export, `<x-dc>`-Format), `support.js` (generierte Viewer-Runtime), `screenshots/` (10 PNGs, synth-Serie u. a.), `uploads/` (11 Rohscreenshots vom 15.06.) — via `1a4515c` aus main entfernt, im Branch `web-export-archiv` gesichert, lokal per `.git/info/exclude` ausgeblendet. *(Unverifizierte Detailangaben.)*
4. **Moodboard/`Inspiration/` und `Clients/` sind absichtlich lokal** (per `.gitignore`, DSGVO-Notiz) — das ist gewollt, ABER: das Moodboard als einziges eigenes Design-Artefakt existiert damit **nirgends versioniert**.
5. **`.thumbnail`: bestätigter Cruft** (Vorschaubild des Artefakt-Exports; die `.gitignore` nennt es selbst so) — löschbar. `dist-single/index.html` ist dagegen VERSIONIERT (Single-File-Build der echten App) — kein Cruft, aber diskussionswürdig. `vela-ux-test.html` existiert nicht mehr; nur der `.gitignore`-Eintrag ist übrig. *(Unverifiziert.)*
6. **Offener Design-Rückbau: 4er-Bento in ThemenHub.** Die Bento-Section aus PR #97 ist als loum.ai-Content identifiziert, der nicht in den Cosmic Calendar gehört — laut git log ist seit `1a4515c` kein Rückbau-Commit erfolgt. Das ist die eine ausstehende Design-Korrektur aus den Sessions.
7. **Token-Drift in `src/lib/tokens.ts`:** violet steht dort noch auf `#8B5CF6` (Z. 10) und `CTA_GRADIENT` auf dem alten Violett-Verlauf (Z. 32) — nicht synchron mit den v6-Werten (`#A78BFA`, azure-Halo) aus `src/index.css:7-55`. Betroffen: alles, was SVG/Canvas aus JS-Konstanten färbt (z. B. ChartWheel).
8. **Veralteter Doc-Kommentar in ThemenHub** (Z. 19-23): behauptet „FIVE … four accordion sections", tatsächlich hat `THEME_SECTIONS` fünf Sektionen plus `kompass` und `fragen` = 8 parallele gecachte Calls; außerdem ist das letzte Theme-Tile per wide-Flag `lg:col-span-2`.

---

## 4. Empfohlenes Vorgehen

1. **Remote-Branch löschen:** `git push origin --delete claude/vela-design-impl-nbuip2` — der Inhalt ist blob-identisch via PR #98 in main, und beim einzigen Diff (`.gitignore`) liegt der Branch sogar zurück.
2. **Archiv-Branch sichern:** `git push origin web-export-archiv` (origin = privates Repo loum-ai/Cosmic_Calendar) — der Branch mit Web-Export, screenshots/ und uploads/ existiert nur lokal; ein Festplattenschaden würde die einzige eigene Design-Historie vernichten.
3. **Moodboard separat sichern:** `Inspiration/Moodboard@2x.png` (+ ggf. .svg) in ein privates Backup außerhalb des Repos legen oder auf einem eigenen `inspiration-archiv`-Branch versionieren — es ist das einzige eigene Design-Artefakt und aktuell per `.gitignore` von jeder Versionierung ausgeschlossen; `Clients/` bleibt wegen DSGVO strikt lokal.
4. **`.thumbnail` löschen** (`rm .thumbnail`) — die `.gitignore` klassifiziert es selbst als Artefakt-Export-Cruft ohne Referenzwert.
5. **`src/lib/tokens.ts` auf v6 synchronisieren:** violet → `#A78BFA`, `CTA_GRADIENT` → azure-Halo (`--grad-halo`, vgl. `src/index.css:49`) — sonst rendern SVG/Canvas-Flächen (ChartWheel) andere Farben als das CSS-System und die „SSOT"-Zusage aus `src/index.css:30` ist gebrochen.
6. **Bento-Rückbau in `src/screens/ThemenHub.tsx`:** die 4er-Bento-Section durch vertikales Karten-Scrolling mit radialen Akzenten ersetzen (Layout-Inventar aus Abschnitt 2, Punkt 9) — die Section ist explizit als loum.ai-Fremd-Content markiert, und die Moodboard-Referenzen stützen das Scroll-Layout; vor Merge Playwright-Screenshot-Check gegen §7 (`docs/PRINZIPIEN.md:71-73`).
7. **Im selben Zug den Doc-Kommentar ThemenHub Z. 19-23 korrigieren** (real: 5 Theme-Sektionen + kompass + fragen = 8 Calls; letztes Tile wide) — ein Kommentar, der dem eigenen Code widerspricht, produziert falsche Annahmen in künftigen Sessions (nachweislich: die Recherche selbst ist darauf hereingefallen).
8. **Design-Richtung dokumentieren:** Abschnitt 1 dieses Dokuments als `docs/DESIGN-RICHTUNG.md` ins Repo, inklusive der Nicht-Ziele (kein Glas auf Karten, keine Prozent-Ringe pro Lebensbereich, kein Phone-Frame, keine Emojis, Gold-Serifen nur für Sign-Poster) — die Cloud-PR-Serie #87–#98 zeigt, dass externe Sessions eine prüfbare kanonische Referenz brauchen, sonst driftet loum-Content wieder ein.
9. **Übernahme-Backlog als Issues anlegen** (Aspekt-Chips, Sign-Poster-Pipeline, Zeit-Tabs Transite, Glyphen-Slider, „Kurz gesagt"-Karte — Abschnitt 2, je mit Quelle) — so bleiben die Moodboard-Erkenntnisse Phase-2-fähig geschnitten, statt in einer lokalen PNG-Sammlung zu versanden.
10. **`dist-single/` entscheiden:** entweder als bewusstes Release-Artefakt in `README.md`/`DEPLOY.md` dokumentieren oder aus der Versionierung nehmen — ein 484-KB-Build in git veraltet mit jedem Commit stillschweigend gegenüber `src/`.
11. **`.gitignore`-Leiche entfernen:** Eintrag `vela-ux-test.html` streichen — die Datei existiert nicht mehr, der Eintrag stiftet nur Verwirrung über angeblich vorhandene Test-Artefakte.
