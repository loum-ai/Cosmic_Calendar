---
name: Startseite — drei Sichten, ein Konzept
description: Architektin, UX/UI und Produkt haben die Vela-Startseite getrennt gemessen. Hier ist das gemeinsame Ergebnis.
date: 2026-07-29
status: Entwurf
---

# Startseite — drei Sichten, ein Konzept

## Worum es geht

Die Startseite ist 10.015 px hoch am Rechner und 17.294 px am Handy. Das sind
20,5 Bildschirme auf dem Telefon, auf dem die Kundin den Link öffnet. 1.688
Wörter, 68 Klickziele, 18 verschiedene Schriftgrößen.

Über die Hälfte davon ist eine einzige Zeile Code: `<ChartExplorer embedded />`
in `src/screens/ThemenHub.tsx:411`. Sie zeigt Aspekte, Planeten und Verteilung
an der Stelle, an der die gekaufte Deutung stehen sollte.

## Was die drei sagen

**Architektin.** Der Weg der Deutung hat zwei Spuren. Für die Kundin liegt sie
fertig in der Datenbank und ist in 0,42 s da. Im Demo-Modus wird sie live
erzeugt: 68 bis 84 Sekunden, gemessen, auch beim zweiten Lauf. Es gibt keinen
Server-Cache für diesen Weg. Die 11 Bildschirme sind das Regal, das Buch fehlt.

**UX/UI.** Der erste Bildschirm ist gut, aber 40 % davon liegt über dem Rad:
Logo, Build-Zeitstempel, Eyebrow, Name, Geburtsdaten, eine Karte mit einem X.
Das Lauteste auf der ganzen Seite sind die NASA-Fotos der Planeten. Die sind
für jeden Menschen der Welt identisch. Das Portrait war bei der Messung sofort
da — aber nur, weil es im Browser-Speicher lag.

**Produkt.** Bezahlt wird eine Zeile in der Datenbank: Lauras Urteil. Alles
andere wird aus dem Geburtsdatum gerechnet, kostet nichts und steht auf jeder
Astro-Seite umsonst. Bei der eigenen Messung war „Dein Portrait" gar nicht auf
der Seite. Nicht am Laden — weg, ohne Meldung.

## Wo sie sich widersprechen

**1. War das Portrait da?** Architektin: lädt 80 Sekunden. UX: sofort da.
Produkt: gar nicht da. Alle drei haben recht — je nach Browser-Speicher.
*Entschieden:* Genau das ist der Befund. Ob die Kundin die bezahlte Deutung
sieht, ist Zufall. Das wiegt schwerer als jedes Layout.

**2. Was zuerst?** Architektin will den Server-Cache, Produkt die
Freigabe-Sperre, UX die Kürzung.
*Entschieden:* Die Sperre. `supabase/functions/interpret/index.ts:497` setzt
„published" ohne zu prüfen, ob `portrait` leer ist. Ein leerer 89,90-Euro-Link
ist möglich. 15 Minuten Arbeit, verhindert echten Kundenschaden. Der
Server-Cache kommt danach, er betrifft nur die Demo.

**3. Wie viel Deutung bleibt oben?** Architektin will nur das Portrait, UX und
Produkt wollen die sechs Lebensthemen dazu.
*Entschieden:* Beide bleiben. Die Lebensthemen sind Deutung, nicht Lexikon —
Prinzip 3 spricht nicht gegen sie. Aber als schmale Liste, nicht als sechs
große Karten.

**4. Der Block „Deine Deutung" am Ende.** UX will ihn ersatzlos streichen, das
Vorkonzept will ihn als Kopftext im Anhang.
*Entschieden:* In den Anhang. Nichts wird gelöscht, sonst diskutieren wir es
in vier Wochen nochmal.

## Das Konzept

Die Regel: **Auf der Startseite wird nichts erzeugt. Nur ausgeliefert.**

**1 · Kopf.** Eine Zeile, 12,5 px, gedämpft. Kein Kasten.
`VELA · Laura · 7. September 1987, 18:50, Starnberg · gedeutet von Laura am 12. Juli`
Der Build-Zeitstempel `Stand 2026-07-29 05:00 UTC` fliegt raus.

**2 · Das Rad.** Volle Breite, erstes Inhaltselement, beginnt bei ~64 px statt
bei 339 px. Darunter, klein: `Tipp einen Punkt an.` Die Karte „Kurz gesagt"
entfällt — sie sagt dasselbe wie das Portrait, nur schwächer.

**3 · Ein Satz.** Das Größte auf der Seite, `--fs-h2`, 30 rem breit, mittig.
Erster Satz des Portraits, auf eine Zeile gekürzt:
> **Du wirkst kühler, als du bist. Innen ist alles durchlässig.**

Aus dem themenneutralen Ganz-Chart-Portrait, nicht aus dem engsten Aspekt.
Damit bekommt kein Lebensthema die größte Schrift (Prinzip 1).

**4 · Umfangszeile.** `Vier Kapitel · etwa 20 Minuten · als PDF zum Mitnehmen`
Das ist die Antwort auf „war das alles?" — vorher gegeben, nicht durch Menge.

**5 · Dein Portrait.** Ungekürzt, ohne Kasten, Text auf Hintergrund wie ein
Brief. 17 px, Zeilenhöhe 1,6, 30 rem breit. Erster Absatz 19 px.
Fehlt es, steht dort ein ehrlicher Satz plus Knopf — nie mehr ein stilles
Verschwinden (heute `ThemenHub.tsx:396`, endet auf `: null`).

**6 · Sechs Linsen.** `Dasselbe Bild, durch sechs Fragen gelesen. Wähl eine.`
Zwei Spalten, 72 px Zeilenhöhe, Glyphe links, Name, ein Halbsatz. Alle sechs
gleich groß und gleich hell. Die abgeschnittenen Riesen-Glyphen fallen weg.
Die Texte werden vorher erzeugt, nicht beim Antippen.

**7 · Was gerade läuft.** Drei Transite mit Datum. Bleibt kurz.

**8 · Schlussmarke.** `Das ist dein Bild, vollständig. Es ändert sich nicht mehr.`
Darunter **Als PDF sichern** und `Fragen dazu? Schreib Laura.`

**9 · Der Ausgang.** Keine Karte, eine Zeile mit Pfeil:
> **Die Rechenwerte →** Alle Positionen, Grade, Häuser und die 21 Aspekte — die Rechnung hinter dem Text oben.

Ziel: vier Bildschirme statt 20,5.

## Was mit dem Rest passiert

Nichts wird gelöscht. Alles zieht hinter „Die Rechenwerte" — das ist der
heutige `ChartExplorer`, der als eigene Ansicht bereits existiert
(`useApp.ts:353`). Dorthin gehen: Aspekte-Liste, Planeten-Grid, Verteilung,
Die großen Drei, die 12 Positionszeilen, „Auf einen Blick" und der Block
„Deine Deutung" als Kopftext.

**Achtung, sonst geht es verloren:** Der PDF-Knopf sitzt heute in
`ChartExplorer.tsx:270`. Er muss vorher an die Schlussmarke umziehen.

## loums CI, konkret

**1 · Schriftgrößen: 18 werden 6.** Heute laufen 9 · 11 · 11,5 · 12 · 12,5 · 13
· 15 · 16 · 17 · 17,5 · 18 · 18,5 · 19 · 21 · 22 · 25 · 27 · 29 px auf einer
Seite. Künftig nur `--fs-h2` / `--fs-lede` 19 / `--fs-body` 17 / `--fs-body-sm`
15,5 / `--fs-meta` 12,5 / `--fs-micro` 11,5. Alles unter 11,5 px fällt.

**2 · Farbe: Fließtext wird lesbar.** Die häufigste Textfarbe ist heute
`rgba(238,245,248,0.55)` — 69 Mal. Das ist loums Mute-Ton, gedacht für
Nebensachen. Fließtext geht auf `--fg-body` = 0,72. Deshalb wirkt heute alles
fahl.

**3 · Abstände: eine Leiter statt Zufall.** Heute liegen Abschnittsabstände
zwischen 16 und 32 px. Künftig: Abschnitt zu Abschnitt 64 px am Handy, 96 px am
Rechner. Karte zu Karte 32 px. Karten-Innenraum 24 px. Lesebreite überall
30 rem. Ein Kartenrezept, eine Kante, keine zweiten Rahmen.

## Reihenfolge

| # | Was | Wo | Stunden |
|---|---|---|---|
| 1 | Freigabe sperren, wenn `portrait` leer ist | `interpret/index.ts:497` | 0,25 |
| 2 | Ehrlicher Leerzustand statt `: null` | `ThemenHub.tsx:382–396` | 0,5 |
| 3 | Zählen, wie viele Deutungen schon leer ausgeliefert sind | Supabase | 0,5 |
| 4 | `<ChartExplorer embedded />` raus, PDF-Knopf umziehen | `ThemenHub.tsx:411` | 1 |
| 5 | Kopf, Rad, Essenzsatz, Umfangszeile | `ThemenHub.tsx` | 3 |
| 6 | Portrait als Brief, Lebensthemen als Liste | `ThemenHub.tsx` | 3 |
| 7 | Server-Cache für den anonymen Weg, Portrait zuerst erzeugen | `interpret/index.ts` | 3 |
| 8 | T-Quadrate zusammenfassen, Signatur bei Gleichstand | `patterns.ts:124` | 4 |
| 9 | Prinzip 7 wirklich prüfen (Rad über der Falz) | `scripts/check-ux.mjs` | 1 |
| 10 | Schriftgrößen, Farben, Abstände auf loums Werte | `src/index.css` | 4 |

Schritte 1 bis 4 sind ein Vormittag. Danach ist der akute Schaden weg und die
Seite halb so lang.

## Was Laura entscheiden muss

1. **Sofort sperren?** Ab dann kann eine Deutung ohne Portrait nicht mehr
   freigegeben werden. Sie landet als Entwurf im Cockpit. Mehr Arbeit für dich,
   kein leerer Link für die Kundin. Empfehlung: ja.
2. **Alte Links prüfen?** Niemand weiß, wie viele bereits verschickte Deutungen
   ein leeres Portrait haben. Die Abfrage in Supabase wurde uns verweigert.
   Empfehlung: nachsehen, bevor irgendetwas anderes passiert.
3. **Vier Bildschirme statt 20 — reicht dir das?** Wenn du befürchtest, dass es
   zu wenig wirkt, ist die Antwort die Umfangszeile und das PDF, nicht mehr
   Inhalt.
4. **Lebensthemen vorher erzeugen?** Heute entstehen sie beim Antippen, live,
   mit dem teuren Modell. Die Kundin wartet dann bis zu zwei Minuten. Vorher
   erzeugen kostet dich einen Klick im Cockpit pro Kundin.
5. **Was steht im Essenzsatz?** Automatisch der erste Satz des Portraits — oder
   schreibst du ihn selbst? Selbst geschrieben ist stärker, kostet dich aber
   zwei Minuten pro Kundin.
