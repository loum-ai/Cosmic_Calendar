---
titel: Home — intuitiver, in loums CI
stand: 2026-07-29
status: Entwurf zur Entscheidung
gilt für: src/screens/ThemenHub.tsx, ChartExplorer.tsx, src/index.css, patterns.ts
maßstab: docs/PRINZIPIEN.md
---

> **Vorentwurf, überholt.** Der aktuelle Stand ist [HOME-KONZEPTE.md](HOME-KONZEPTE.md)
> — dort haben Architektin, UX/UI und Produkt getrennt gemessen. Diese Datei
> bleibt, weil sie die Messung am Rechner und die Kapitel-Idee enthält.

# Home — intuitiver, in loums CI

## Der Befund in Zahlen

Gemessen am laufenden Dev-Server: **10.692 px Seitenhöhe** bei 946 px Viewport = 11,3 Bildschirme.
1012 Elemente, 354 Textknoten, 68 interaktive Elemente, 1688 Wörter. „DIE SPANNUNG, DIE DICH
ANTREIBT" steht **dreimal** identisch da. Sonne/Mond/AC erscheinen **viermal**, jedes Mal mit
demselben Ziel-Sheet. 6 von 10 Hauptblöcken sind Lexikon, nicht Deutung.

Das verletzt **Prinzip 3** — „Deutung, nicht Beschreibung. Das Fachliche liegt darunter als
optionaler Detail-Layer." ASPEKTE, PLANETEN und VERTEILUNG als eigene Seitenabschnitte sind
exakt der Baustein-Modus, den unser eigenes Prinzip verbietet. Nicht Geschmack — Regelbruch.

Zwei weitere Brüche, die kein Design heilt, weil sie im Rechenweg sitzen:
- Die drei T-Quadrate sind **eine** Figur, dreimal gezählt (`patterns.ts:122` läuft über Tripel
  ohne Konjunktions-Kollaps).
- Die Signatur sagt „FEUER-BETONT" bei Feuer 4 / Erde 4 — **Prinzip 2 ist heute schon gebrochen**,
  gerechnet, nicht halluziniert.
- Und: „Dein Portrait" stand nach 12 s Wartezeit immer noch auf „Dein Bild setzt sich zusammen …".
  Die einzige echte Deutung der Seite kommt unzuverlässig an. **Das ist die Krankheit; überladen
  ist das Symptom.**

## Die Entscheidung

**Fundament ist B (Kapitel), aber als EIN durchgehender Strang statt fünf Screens.**
Kapitelmarken, Kapitelzählung, sichtbares Ende — ohne Routing, ohne fünf Abbruchstellen. NN/g ist
eindeutig: wer ohnehin alles lesen will, zahlt Klicks ungern; Länge ist nie das Problem, Struktur
ist es. Aus **A** kommt der eine Essenzsatz, aus **C** das Rad als Navigation in den Detail-Layer.

So sind die Einwände des Härtetests gelöst:
- *check-ux bricht* — nein. Kopf und Burger bleiben, Sheet-Mechanik bleibt, kein neues Routing.
  Als einziges der drei Konzepte hält dieser Weg alle vier bestehenden Schritte.
- *Prinzip 7 wird umgedeutet* — nein. Das Rad bleibt erstes Inhaltselement, keine H1 davor.
- *Prinzip 1 wird verletzt (A)* — gelöst: der Essenzsatz wird aus dem **themen-neutralen Portrait**
  gezogen, nicht aus dem engsten Aspekt. Kein Lebensthema bekommt die größte Schrift der Seite.
- *„Das war's?"* — gelöst durch angekündigten Umfang (Kapitelzahl, Minuten, Fortschritt),
  Schlussmarke und PDF, nicht durch Volumen.
- **Offenes Risiko:** fällt der KI-Text aus, hat die Seite fünf Kapitelköpfe ohne Text. Deshalb ist
  der gerechnete Boden (unten, Schritt 4) Vorbedingung, nicht Nacharbeit.

## Die Home, von oben nach unten

1. **Kopf**, eine Zeile, `--fs-meta`, `--fg-mute`, Burger rechts:
   `LAURA · 3. Mai 1990, 14:12 Uhr, München`
2. **Das Rad**, volle Breite, erstes Inhaltselement. Darunter `--fs-micro`, `--fg-low`:
   `Alles hier ist antippbar.`
3. **Die Essenz**, `--fs-h2`, `--w-narrow`, ein Satz, aus dem Portrait:
   „Du wirkst ruhiger, als du bist. Innen läuft die Prüfung immer mit."
4. **Umfangszeile** mit fünf Punkten: `Fünf Kapitel · etwa 20 Minuten`
5. **Ein Strang, fünf Kapitel**, direkt untereinander, je ein eigener Rhythmusschritt
   (`--section-gap`), Sprungmarken in der sticky Leiste — kein Screenwechsel:
   - `01 Wer du bist` — das Portrait, in voller Länge, ungekürzt.
   - `02 Woran du dich reibst` — die Spannungsfigur, **eine** Karte, Titel aus ihren Planeten.
   - `03 Was dir leicht fällt` — Fluss-Aspekte und Elementlage als Prosa, kein Balkendiagramm.
   - `04 Deine sechs Felder` — die Lebensthemen und Human Design, unverändert. Der Mechanismus bleibt.
   - `05 Was gerade läuft` — Transite, mit Datum.
6. **Der Ausgang**, beschriftet, ruhig, keine Karte:
   `Die Rechenwerte →` · „Alle Positionen, Grade, Häuser und Aspekte, aus denen das oben entstand."
7. **Schlussmarke**: „Das ist dein Chart, vollständig. Es wächst nicht weiter." + `Als PDF sichern`.

Ziel: **~4 Bildschirme**, kein Akkordeon, ein Bogen.

## Wo alles andere hinwandert

| Heute auf der Home | Künftig | Weg dorthin |
|---|---|---|
| Aspekte, Planeten-Grid, Verteilung, Die großen Drei, 12 Positionszeilen | Anhang „Die Rechenwerte" (= heutiger `ChartExplorer`, unverändert) | ein beschrifteter Ausgang |
| dieselben Fakten, planetweise | Sheet am Rad | Punkt/Linie antippen |
| `AI.summary` (zweite Synthese) | Kopftext des Anhangs | dort |
| „Auf einen Blick"-Kacheln | Kapitel 01 als Prosa | im Strang |
| Kacheln „Element"/„Modus" → `setHomeView("chart")` | ersatzlos, doppelter Weg | — |
| Sparkline-SVG (fest verdrahtet, ohne Datenbezug) | gelöscht | — |

Nichts verschwindet. Jeder Inhalt ist in höchstens zwei Ebenen erreichbar (NN/g-Grenze).

## Was loums CI konkret bedeutet

PR #105 hat **die Palette** erledigt: Akzent auf Aura-Violett, Kartenchemie solide mit
1px-Inset-Hairline, `tailwind.config.ts` auf loum-Werte. Angewendet ist der Rest nicht:
**512 `var(--…)` gegen ~1140 hardcodierte Werte** (421× `text-[Npx]`, 487 Hex, 233 `rgba(`).

- **Type-Ramp.** Fließtext `--fs-body` 17 px / `--lh-body` 1.55 in `--fg-body` (72 %) statt heute
  14 px in `--fg-mute` (55 %). h1/h2 auf `clamp` statt 30/24 px fix; `--fs-h3` einführen; Gewicht
  700 raus (kommt in keiner loum-Rolle vor). Boden `--fs-micro` 11.5 px — die 13× 9/9.5 px fallen.
- **Weißraum.** `--container-pad`, `--section-gap` (48/64/96) und `--card-gap` als echte
  Tailwind-Tokens. Sektionsabstände von heute 16–32 px auf 64–96 px. Lesetext auf `--w-narrow`
  30 rem statt heute sieben freien Maßen.
- **Kartenchemie.** `--surface-card` + **eine** Kante `--card-hairline`, Radien aus loums Ramp
  (6/10/14/18/24). Die **127 Pillen** raus außer dem einen CTA. Löschen: `.vela-bloom`,
  der `.vela-cine`-Wash, `.vela-gradient-card`, der globale Icon-Glow (`index.css:459-465`) und die
  Iris-Eyebrows (`452-457`). shadcn-Bridge (`index.css:34-54`) auf v6 — `--border` wirkt über
  `* { border-color: … }` heute violett auf **jede** Kante der App.
- **Bewegung.** 11 Endlos-Animationen auf **eine** ambiente (Sternfeld). `hue-rotate(18deg)` raus,
  es verschiebt die Markenfarbe aktiv vom Token weg. Stattdessen loums Choreografie beim Eintritt:
  Essenz `--t-reveal` 700 ms, dann 180-ms-Takt, `--e-out`. „Never all at once."

## Prinzip 7 und die UX-Zusagen

Das Rad bleibt erstes Inhaltselement, vor der Essenz, über der Falz — **Prinzip 7 unverändert,
keine Auslegung nötig**. Die vier Schritte in `scripts/check-ux.mjs` bleiben gültig und laufen
weiter: Kopf und Burger bleiben stehen (Schritt 4, Zeichen-Portal), Sheet-Mechanik und
Ein-Ausgang-Regel bleiben unangetastet. **Neu hinzuzufügen**, weil das Skript heute weder Höhe
noch Abschnitte misst:

- `wheel.boundingBox().y + h <= innerHeight` bei `scrollY = 0` (statt nur „erstes DOM-Element").
- `document.body.scrollHeight <= innerHeight * 5` — die Obergrenze, gegen Rückfall.
- Lint-Regel in `check`: kein `text-[…px]`, kein rohes Hex in `src/`.

## Umsetzung

| # | Schritt | Aufwand | Wirkung |
|---|---|---|---|
| 1 | `<ChartExplorer embedded />` (`ThemenHub.tsx:411`) raus, beschrifteter Ausgang „Die Rechenwerte" hin | **30 Min** | 11,3 → ~4 Bildschirme |
| 2 | Vier CSS-Blöcke löschen + shadcn-Bridge auf v6 | 1–2 h | die Unruhe ist weg, sofort sichtbar |
| 3 | Rechenfehler: Konjunktions-Kollaps in `patterns.ts`, Gleichstand in der Signatur, Transit-Ranking | ½ Tag | Prinzip 2 wieder gehalten, „dreimal" verschwindet |
| 4 | **Portrait zuverlässig machen** + gerechneter Boden für Essenz und Kapitel 01 | 1 Tag | ohne das ist alles andere ein Regal ohne Buch |
| 5 | Type-Ramp und Rhythmus umstellen, `text-[…]` und Hex tilgen | 1–2 Tage | die CI kommt wirklich an |
| 6 | Kapitelmarken, Umfangszeile, Schlussmarke, PDF-Link | 1 Tag | Wertigkeit ohne Volumen |
| 7 | Motion: Endlos-Animationen raus, Stagger rein | ½ Tag | Ruhe |

Schritt 1–3 sind ein Vormittag und lösen den akuten Ärger. 4 ist der eigentliche Blocker.
5–7 sind die CI. Alles darüber hinaus (eigene Kapitelscreens, Rad-Tour) wartet.

## Offene Entscheidungen für Laura

1. **Woher kommt der Essenzsatz?** Empfehlung: erster Satz des Portraits, redaktionell gekürzt —
   themen-neutral, kein neues Feld, keine Neuerzeugung für Bestandskundinnen.
2. **Anhang als Abschnitt am Seitenende oder eigene Route?** Empfehlung: eigene Route
   (`homeView="chart"` existiert bereits), damit die Home wirklich kurz ist.
3. **Bestandskundinnen** — bekommen die bereits ausgelieferten Links den neuen Aufbau ohne neue
   Gemini-Runde? Empfehlung: ja, alles Neue speist sich aus vorhandenen Feldern.
4. **`src/screens/HeuteScreen.tsx` ist toter Code** (nirgends importiert). Empfehlung: löschen.
5. **Guard „kein `text-[…px]`, kein Hex"** vor oder nach Schritt 5? Empfehlung: danach, sonst
   blockiert er den Umbau selbst.
