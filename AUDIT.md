# UX-Audit — was Claude Design nicht (vollständig) umgesetzt hat

Aus den drei Chat-Transkripten (`vela-app-nachbau/chats/`) wurden die Punkte
herausgezogen, die die Nutzerin **mehrfach** verlangt hat, die aber nie ganz
gelandet sind. Diese Reimplementierung löst sie **strukturell**, damit sie
nicht erneut zurückfallen können.

| # | Wiederholte Forderung (Originalton) | Lösung in dieser App |
|---|---|---|
| 1 | „Wieso haben die anderen Seiten andere Typografie?!" / „Der Hintergrund überall wie auf Home" | Ein einziges Design-System: jeder Screen läuft durch `ScreenShell` + globalen `AuroraBackground`. Stile kommen nur aus Tokens/Tailwind. Kein Screen stylt für sich. |
| 2 | „nicht astrologie sprache … der user ist komplett lost" | Klartext zuerst; **Klartext-Toggle** im Header (`KlartextToggle` + `glossary.ts`); jedes „Was ist das? / Bei dir"-Schema. |
| 3 | „man muss auch alle verbindungen anklicken können" | Universelles `<Explainable>` für jeden Planeten, Aspekt, jedes Haus, Zeichen, Knoten → keine toten Zonen, immer dasselbe Sheet. |
| 4 | „Close funktioniert immer noch nicht" (3×) | Ein robustes `Sheet`/`Dialog` (Radix): Schließen per X, Backdrop, ESC und Swipe-down. Bug an der Wurzel behoben. |
| 5 | „Ich kann nichts lesen zu klein … full width" | Kein Phone-Frame; flüssige `clamp()`-Typo-Skala; getestet bei 360–1024px. |
| 6 | Lernen-Featured-Card leer / Pills abgeschnitten | Daten gegen `undefined` abgesichert; Pills in echtem Overflow-Scroll mit Full-Bleed-Padding. |
| 7 | „bitte keine emojis" | Glyphen über Symbol-Font (`font-variant-emoji: text`), nie als Emoji. |
| 8 | „Fake-Interaktion. Der 'Resonanz'-Regler … ohne jede Konsequenz" | Keine Bedienelemente ohne Wirkung; jeder Schalter verändert echte Ausgabe. |
| 9 | „die gleiche Micro Interaktion" / „keinen rythmus" | Layout-Vielfalt (Slider/Grid/Chips/Pathway) + kinematische Transit-Vollansicht mit funktionierendem Close. |

## Kreative Verbesserungen (intuitiver, „sei kreativ")

- **Klartext-Modus** als sichtbarer Schalter — die meistgenannte Beschwerde
  wird zum Feature.
- **Universelles Tap-to-understand** + einmaliger Coach-Hinweis „Tippe alles,
  was leuchtet".
- **Q&A auf jedem Tab** (`Composer`), mit kontextabhängigen Beispielfragen.
- **In <3s scannbare „Große Drei"** auf Heute zur sofortigen Orientierung.
- **Zeitreise-Scrubber** auf Transite + swipebare Detail-Deck-Navigation.

> Phase 1 verankert diese Lösungen im Gerüst. Phase 2 arbeitet jeden Screen
> pixelgenau aus — auf diesem Fundament können die alten Probleme nicht
> zurückkehren.
