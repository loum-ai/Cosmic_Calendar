# Wissensbasis — Quellen, Weg, Grenze

Wie Fachwissen in eine Vela-Deutung gelangt, was dabei mitreisen darf und was
nicht. Stand 27.07.2026.

## Der Weg

```
Wissen/            Quellen, lokal          →  lesen, nicht einlesen
   ↓ (Laura formuliert eigene Einträge)
knowledge          Tabelle in Supabase     →  category · subject_key · title · body
   ↓ (embed-knowledge)
knowledge.embedding                        →  gemini-embedding-001, 768 Dimensionen
   ↓ (match_knowledge, 4–8 Treffer je Anfrage)
interpret / generate                       →  FACHWISSEN im Systemprompt
   ↓
Deutung beim Kunden
```

`grounded: true` in einer Antwort heißt: dieser Weg wurde gegangen.

## Die Grenze

**Was mitreist:** Struktur und Unterscheidungen. Also: welche Fälle ein
ernsthaftes Werk trennt, wo es Grenzen zieht, welche Dimensionen es für
erwähnenswert hält.

Beispiel, umgesetzt am 27.07.: Robert Hands „Buch der Transite" gliedert in 604
Überschriften „Planet Aspekt Planet" und trennt dabei Dauer, Rückläufigkeit,
Haus und Richtung. Genau diese vier Dimensionen fehlten im Auftrag an das
Modell — sie stehen jetzt in `transitDetails()`, gerechnet aus der Ephemeride.
Aus dem Buch stammt die Erkenntnis, dass sie zählen. Kein Satz Text.

**Was nicht mitreist:** die Formulierungen. Die Deutungen gehen über
Klienten-Links an zahlende Kunden — das ist Verbreitung, kein privates Lernen.
Deshalb liegen die PDFs unter `Wissen/` und sind gitignoriert wie `Clients/`
(DSGVO) und `Inspiration/`.

Einträge in `knowledge` sind Lauras eigene Sätze. Dass sie Hand und Ring
gelesen hat, steckt darin — genau da, wo es hingehört.

## Was in `Wissen/` liegt

```
astrologie/     22 Werke · ~820.000 Wörter
human-design/    4 Werke · ~178.000 Wörter
sonstiges/       1 Werk   · ~121.000 Wörter (Hasselmann, Seelenbilder — drittes System)
```

Vermessen am 27.07. (raunende Begriffe je 1000 Wörter, Fachbegriffe je 1000):

| Werk | Wörter | raunend | konkret |
|---|---:|---:|---:|
| Hamaker-Zondag, Deutung der Häuser | 66.470 | 0,1 | 26,8 |
| Robert Hand, Buch der Transite | 240.847 | 0,3 | 2,8 |
| Vehlow, Transite & Hilfshoroskope | 91.654 | 0,4 | 4,8 |
| Thomas Ring, Menschenkunde | 83.963 | 0,8 | 2,1 |
| Werner Held, Karma im Horoskop | 8.587 | 10,8 | 6,5 |
| Steiner, Mensch und Sterne | 52.843 | 3,7 | 2,3 |

Die beiden umfangreichsten Werke sind die nüchternsten. Die esoterisch
gefärbten sind die kleinen und machen zusammen unter 10 % des Materials aus —
relevant, weil die App-Regeln raunendes Vokabular ausdrücklich verbieten.

## Stand der Tabelle `knowledge`

```
12 Häuser · 12 Planeten · 12 Zeichen · 5 Aspekte · 5 Würden · 3 Knoten  =  49
Ø 120–200 Zeichen je Eintrag
Human Design: 0
```

Die 49 sind Lehrbuchdefinitionen — Wissen, das Gemini ohnehin hat. Wert
entsteht dort, wo das Modell nichts hat: bei Lauras eigener Lesart, und bei
Human Design. Die App **rechnet** HD bereits (`src/lib/humandesign.ts`),
erwähnt es aber in keinem Deutungstext.

## Einen Eintrag anlegen

```sql
insert into knowledge (category, subject_key, title, body)
values ('hd_typ', 'hd:generator', 'Generator',
        'Zwei bis drei Sätze in Lauras Worten — was sie bei diesem Typ
         tatsächlich sieht und ihren Kunden sagt.');
```

Danach `embed-knowledge` aufrufen; die Funktion holt alle Zeilen ohne Vektor
und trägt sie nach. Ohne Vektor findet `match_knowledge` den Eintrag nicht.

**Modellbindung:** Einbettungen laufen auf `gemini-embedding-001` mit 768
Dimensionen — beim Einlesen UND beim Suchen. Ein Modellwechsel macht alle
vorhandenen Vektoren unbrauchbar und verlangt einen kompletten Neulauf.
