# Vela — Modell-Router: Entscheidungs-Grundlage

Stand: Juli 2026. Dieses Dokument hält die **belegte** Grundlage für den
anbieter-offenen (provider-agnostischen) Modell-Router fest — damit die
Entscheidung nachvollziehbar bleibt und nichts auf Hörensagen basiert.

Recherche-Methode: Deep-Research-Harness (59 Agenten, 24 Quellen gefetcht,
9 Behauptungen 3-fach adversarial gegengeprüft — 2/3 „refute"-Stimmen töten
eine Behauptung). Nur was die Gegenprüfung überlebt hat, steht unter
„Belegt". Der Rest ist ehrlich als „Richtungsdaten" oder „widerlegt" markiert.

Leitregel von Laura: *„Keine Halluzinationen."* — Deshalb hier die harte
Trennung zwischen belegt und ungesichert.

---

## Kernaussage (die unbequeme, aber entscheidende)

Für den **Kern — die lange, emotional tragende deutsche Deutung** — existiert
**kein vertrauenswürdiger unabhängiger Benchmark.** Die Recherche hat gezielt
danach gesucht und nichts gefunden, das der Gegenprüfung standhielt:

- Zwei konkrete „Deutsch-Qualität"-Behauptungen wurden **widerlegt** (siehe
  unten) — es waren Hersteller-Marketing, keine Messungen.
- Alle „LLM-Leaderboard 2026"-Aggregatoren (inkl. der German-Benchmark-Seiten)
  wurden als **unzuverlässig** eingestuft — SEO-Seiten ohne belastbare Methodik.

**Konsequenz:** Die Moat-Frage („welches Modell schreibt die beste deutsche
Deutung?") ist **nicht per Report entscheidbar — nur per Blind-Geschmackstest**
an echten Vela-Deutungen. Genau deshalb ist der Router bewusst **anbieter-offen**:
nichts fest verdrahten, Modell pro Kontext wählbar und jederzeit tauschbar halten.

---

## Belegt (3–0 verifiziert, mit Quellen)

**Mistral Large 3** (europäisch, veröffentlicht 2. Dez 2025, offene Gewichte,
MoE 675B total / 41B aktiv):

| Eigenschaft | Wert | Quelle |
|---|---|---|
| Preis | **$0,50 / 1M input · $1,50 / 1M output** | mistral.ai/news/mistral-3, openrouter.ai |
| Kontext | 262K Token | HuggingFace-Modelkarte, docs.mistral.ai |
| Strukturiert | natives JSON + Function-Calling | docs.mistral.ai/capabilities/function_calling |
| Sprachen | 40+ inkl. Deutsch | mistral.ai/news/mistral-3, HF-Modelkarte |

**Ministral 3** (3B / 8B / 14B, base/instruct/reasoning, Apache 2.0):
kleiner, billiger, selbst hostbar — Option für Chat + strukturierte Extraktion.

Quellen:
- https://mistral.ai/news/mistral-3/
- https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512
- https://docs.mistral.ai/models/model-cards/mistral-large-3-25-12
- https://docs.mistral.ai/capabilities/function_calling/
- https://openrouter.ai/mistralai/mistral-large-2512

---

## Richtungsdaten (NICHT verifiziert — als Gerücht behandeln)

Aus Such-Snippets, die als Quelle „unzuverlässig" eingestuft wurden. Nur
gelistet, damit das Feld bekannt ist — **nicht** als Entscheidungsgrundlage:

- Preise: *Claude Sonnet 5 ~$2–3/$15, GPT-5.4 ~$2,50/$15* (je 1M in/out)
- Latenz: *Gemini Flash ~0,45 s bis erstes Token, Claude Haiku ~0,6 s* (beide
  sehr schnell für Chat)
- Structured-Output-Fehlerraten: *OpenAI <0,1 %, Anthropic <0,2 %,
  Gemini <0,3 %* (alle drei sehr zuverlässig)

---

## Widerlegt (in der Gegenprüfung gefallen)

- „Mistral Large ist nativ fließend in fünf Sprachen inkl. Deutsch, mit
  nuanciertem Grammatik-/Kulturverständnis" — **1–2 gegen** (Marketing-Aussage).
- „Mistral Large schlägt LLaMA-2-70B auf HellaSwag/ARC/MMLU speziell auf
  Deutsch" — **0–3 gegen** (nicht belegbar).

---

## Router-Empfehlung (auf Basis des Belegten)

| Tier | Modell | Grund |
|---|---|---|
| **Kern-Deutung** (Moat) | **offen — per Blind-Test an echten Readings entscheiden** | Kein Benchmark taugt; Kandidat ist das jeweils stärkste Prosa-Modell. |
| **Chat-Follow-ups** | günstiges, schnelles Modell (Mistral Large 3 / Ministral, oder ein „Flash"/„Haiku") | belegt billig + schnell genug |
| **Strukturierte Fakten** | dasselbe günstige Modell im JSON-Mode | belegt zuverlässig |

**Design-Konsequenz:** Der Router bleibt anbieter-offen. Er wählt pro Kontext,
und das Kern-Modell ist jederzeit umsteckbar, ohne Code umzubauen. Die
tatsächliche Kern-Modellwahl fällt über einen Blind-Geschmackstest an echten
deutschen Deutungen, nicht über einen Report.

---

## Offene Fragen (bewusst offengelassen)

1. Wie schlägt sich das jeweils gewählte Kern-Modell im Blind-Test an echten
   Vela-Deutungen (deutsch, lang, emotional) gegen die Alternativen?
2. Aktuelle (Mitte 2026) Preise/Kontext/Zuverlässigkeit der Nicht-Mistral-
   Anbieter — in der verifizierten Evidenz gar nicht enthalten.
3. Gemessene Latenz pro Kandidat, speziell für den immer sichtbaren Chat.
4. Ändert Mistrals Selbst-Hosting-Pfad die Gesamtkosten gegenüber gehosteten
   APIs bei Velas erwartetem Volumen?

> Zeit-Empfindlichkeit: Preise und Verfügbarkeit sind Stand ~Dez 2025 (Release
> „2512"), verifiziert bis Mitte 2026, können sich aber schnell ändern. Vor
> einer harten Festlegung neu prüfen.
