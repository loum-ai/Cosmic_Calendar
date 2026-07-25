# Plan: Nutzerführung, Karten und Chat

Stand 25.07.2026 · **Plan, nichts davon ist umgesetzt oder deployt.**

Ausgangspunkt: „Auch der Chat sollte so aussehen wie bei The Pattern (aber mit
unserem Design) und The Pattern hat auch irgendwie eine aufgeräumtere
Nutzerführung, auch die Cards sehen schöner aus."

---

## 1 · Was The Pattern tatsächlich macht

Recherchiert, nicht aus dem Gedächtnis behauptet — Quellen unten.

| | The Pattern | Vela heute |
|---|---|---|
| Ebenen | 3 Tabs: **Your Pattern · Your Timing · Bonds** | Home, Transite, Lernen, Synastrie, Profil, Chat (6) |
| Struktur im Inhalt | 3 Abschnitte (**Foundation · Development · Relationships**) → 6 Unterbereiche | 8 Lebensthemen + Rad + Muster + Aspekte + Planeten + Verteilung |
| Länge einer Einheit | eine Passage = ein Gedanke, 1–2 Sätze pro Karte | 3–5 Sätze pro Karte, Themenabschnitte 2–3 Absätze |
| Sprache | **null Fachbegriffe.** Keine Sternzeichen, keine Aspekte im Text — liest sich wie ein Myers-Briggs-Ergebnis | Fachbegriff als Eyebrow, Bedeutung als Überschrift (schon richtig), aber „Orbis", „Quadrat", „Stellium" stehen sichtbar |
| Was Nutzer kritisieren | 30 Slides durchwischen für EIN Thema; Wunsch nach einer scrollbaren Seite | eine Home-Seite mit **9.504 px** Länge (heute gemessen) |

**Die Erkenntnis:** Nicht der Slide-Mechanismus ist das Vorbild — der wird von
Nutzern ausdrücklich kritisiert. Vorbild ist die **kleine, benannte Zahl von
Fächern** und die **konsequente Jargonfreiheit**. The Pattern wirkt
aufgeräumter, weil es weniger Fächer hat, nicht weil es hübschere Karten hat.

Vela hat das umgekehrte Problem: viel Inhalt, wenig Fächer. Ich habe heute auf
deinen Wunsch das ganze Rad auf die Home geholt — richtig, weil es vorher
niemand fand, aber die Seite ist damit sehr lang. Der nächste Schritt ist
nicht „weniger zeigen", sondern **ordnen**.

---

## 2 · Vorschlag A — die Home bekommt Fächer statt einer Scrollstrecke

Drei benannte Ebenen, in dieser Reihenfolge, jede mit einem eigenen Anker oben
auf der Seite (sticky Segment-Leiste, kein neues Menü):

1. **Wer du bist** — Portrait, Kurz gesagt, die großen Drei, besondere Muster
2. **Was in dir wirkt** — das Rad, Planeten, Aspekte, Häuser, Verteilung
3. **Was gerade läuft** — Transite, „Heute", Lebensphasen

Die 8 Lebensthemen bleiben, wandern aber unter **Wer du bist** als eine Reihe
statt als eigener Block dazwischen. Das reduziert die Home von einer Strecke
auf drei Kapitel, ohne einen einzigen Inhalt zu verstecken.

**Aufwand:** mittel. Kein neuer Inhalt, nur Umgruppierung plus eine
Segment-Leiste. Rückbaubar.

---

## 3 · Vorschlag B — Karten: eine Sorte statt fünf

Heute existieren nebeneinander: `inkSurface()` (Themen), `vela-card-soft`
(Portrait, Human Design), die Muster-Karte in `ChartExplorer`, die
Planeten-Fotokarte, die Kachel in „Auf einen Blick", die Sheet-Deutungsbox.
Sechs Kartenbauarten mit unterschiedlichen Radien, Kanten und Glows — deshalb
wirkt es unruhiger als The Pattern, nicht wegen der Ästhetik der einzelnen
Karte.

Vorschlag: **eine** Kartenkomponente mit drei Größen und einem `tone`.

```
<VelaCard size="lead|row|tile" tone={akzentfarbe}>
```

- feste Radien: 20 px (lead), 16 px (row), 14 px (tile)
- EINE Kante: die Inset-Hairline, kein äußerer Schatten (steht schon so im
  Kommentar von `inkSurface`, wird aber nicht überall eingehalten)
- Glow nur von innen, in der Akzentfarbe des Inhalts
- Aufbau immer gleich: Eyebrow (Fachbegriff) → Überschrift (Bedeutung) →
  Text → optionaler Aufklapp-Bereich

**Aufwand:** mittel-hoch, aber rein visuell und gut prüfbar (Screenshot-Vergleich
vorher/nachher pro Screen).

---

## 4 · Vorschlag C — der Chat

So sieht er bei The Pattern aus, übersetzt in unser Design:

1. **Kein leeres Eingabefeld als Startzustand.** Stattdessen 4–6 Vorschlagskarten,
   die aus DEM Chart kommen, nicht aus einer festen Liste:
   „Warum ziehe ich immer wieder dieselbe Sorte Mensch an?" (bei enger
   Venus-Pluto-Verbindung), „Warum fällt mir Loslassen so schwer?" (bei Saturn
   im 8.). Der Code kann das: `chartPatterns()` liefert die Konfigurationen
   bereits, aus denen sich die Fragen ableiten lassen.
2. **Antwort als Karte, nicht als Sprechblase.** Gleiche Karte wie überall
   sonst, mit Eyebrow „Vela deutet", darunter der Text — und darunter zwei bis
   drei Anschlussfragen. Das hält den Nutzer in Bewegung, ohne dass er sich
   selbst etwas ausdenken muss.
3. **Jede Antwort zeigt, worauf sie sich stützt.** Eine Zeile unter dem Text:
   „gelesen aus: Mond in Skorpion, 7. Haus · Sonne Quadrat Mars 1,3°" —
   antippbar, öffnet das jeweilige Sheet. Das ist der Punkt, an dem Vela The
   Pattern schlagen kann: The Pattern versteckt die Astrologie komplett, wir
   können sie **auf Wunsch** aufklappen.
4. **Verlauf bleibt.** Heute ist der Chat nach dem Schließen weg. Die Fragen
   und Antworten gehören in `readings_cache` (Schlüssel gibt es schon:
   `q:<hash>`), damit man zurückblättern kann.

**Aufwand:** hoch. Punkte 1 und 2 sind der Großteil des Effekts und für sich
allein machbar.

---

## 5 · Vorschlag D — Jargon konsequent in die zweite Reihe

Die Regel steht schon im Code („meaning-first: jargon lives in the eyebrow"),
wird aber nicht überall befolgt. Sichtbar geblieben sind: „Orbis" in jeder
Aspektzeile, „Stellium", „T-Quadrat", „Chart-Herrscher", „Placidus".

Vorschlag: Fachbegriffe stehen nur noch im Eyebrow und im Lernen-Bereich. In
Fließtexten wird die Gradzahl zur Nähe-Aussage („sehr eng" statt „1,3° Orbis"),
mit der Zahl als Tooltip. Rein sprachlich, kein Umbau.

**Aufwand:** klein.

---

## 6 · Reihenfolge, wenn du es machen willst

| Schritt | Wirkung | Aufwand |
|---|---|---|
| D — Jargon in die zweite Reihe | sofort spürbar, null Risiko | klein |
| C1+C2 — Chat mit Vorschlagskarten und Karten-Antworten | der Punkt, den du genannt hast | mittel |
| A — Home in drei Kapitel | löst die 9.504 px | mittel |
| B — eine Kartensorte | macht das Ganze ruhig | mittel-hoch |
| C3+C4 — Belege und Verlauf | Alleinstellung gegenüber The Pattern | hoch |

---

## Quellen

- [The Pattern App: Features, Pricing, Readings, & More — Bustle](https://www.bustle.com/life/pattern-app-review-features-price)
- [What Is 'The Pattern'? — Newsweek](https://www.newsweek.com/what-pattern-everything-you-need-know-about-app-channing-tatum-freaking-out-over-1449099)
- [The Pattern App Review 2026 — Aurae](https://www.auraeastrology.com/blog/the-pattern-app-review-2026-an-astrologers-honest-opinion)
- [Nutzerkritik am Slide-Mechanismus — Uxlynx](https://uxlynx.com/the-pattern-app-ruined-my-life/)
- [The Pattern im App Store](https://apps.apple.com/us/app/the-pattern-astrology/id1071085727)
