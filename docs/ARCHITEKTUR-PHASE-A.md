# Vela — Architektur Phase A (Mandanten-Backend + echte Deutung)

Stand: Juni 2026. Dieses Dokument hält die Entscheidungen und die Recherche-Grundlage
fest, damit nichts verloren geht.

## Ziel

Laura (Astrologin) legt Kundenprofile an → echtes Geburtsrad wird berechnet & gegen
unabhängige Autoritäten geprüft → Gemini schreibt die echte, spezifische deutsche
Deutung → Laura prüft/editiert (Review-Gate) → Kundin bekommt einen dauerhaften,
unratbaren Link. Bei jedem Aufruf werden die Transite frisch gegen das Geburtsbild
gerechnet.

Kernregeln (von Laura vorgegeben):
- **Nur Laura** gibt Daten ein (Admin-Login). Kundinnen haben keinen Login.
- **Keine generischen Template-Texte** — echte Deutungen.
- **Daten gegen mind. 5 Quellen verifizieren** (ehrliche Umsetzung siehe unten).
- Deutung mit **Gemini Flash**.
- Kundendaten **bleiben bestehen**; Transite **bei jedem Seitenaufruf neu**.

## Backend

- **Supabase-Projekt:** `Vela-Astrology` (`khcwkssirzqcwboaisco`), Region `eu-west-1` (EU).
  Sauber getrennt von den `loum-*`-Projekten.
- **Tabellen** (Migration `vela_core_schema`):
  - `clients` — Geburtsdaten + `access_token` (unratbarer Kundenlink), nur Admin schreibt.
  - `charts` — berechnetes Natal-Chart (`data` jsonb) + `verification` jsonb, 1:1 zu client.
  - `interpretations` — Status `draft → in_review → approved → published` (+ `rejected`),
    `facts`/`draft`/`edited`, Modell + Temperatur. Kundin sieht nur `published`.
  - `knowledge` — Lauras kuratierte Deutungs-Bausteine (RAG), `embedding vector(768)` (pgvector).
  - `app_admins` — Admin-Allowlist; `private.is_admin()` in RLS.
- **RLS:** alles admin-only (`private.is_admin()`); Kundinnen greifen **nie** direkt auf die
  DB zu, sondern ausschließlich über Edge Functions (Service-Role), per `access_token`.
- Security-Advisor: 0 Findings.

## Berechnung (Daten)

- **Engine: Swiss Ephemeris** — genau die Engine, die astro.com nutzt; Übereinstimmung mit
  NASA JPL bis ~0,001″. WASM-Build (`@fusionstrings/swiss-eph` / `swisseph-wasm`) läuft in
  der Supabase Edge Function (Deno). Ersetzt `circular-natal-horoscope-js` (Moshier, ~1″,
  seit 2021 ungepflegt).
- **Lizenz-Hinweis:** Swiss Ephemeris ≥ 2.10.1 ist AGPL-3.0. Für kommerziellen
  Closed-Source-Betrieb vor Live-Gang **Profi-Lizenz von Astrodienst** kaufen — oder Backend
  offenlegen. Lizenz-saubere Alternative: `astronomy-engine` (MIT, ±1 Bogenminute).
  → Entscheidung erst zum Live-Gang nötig.

## „5 Quellen"-Verifikation (ehrlich)

Fast alle Astro-Dienste (astro.com, astro-seek, AstrologyAPI, Prokerala, …) rechnen mit
**derselben** Swiss Ephemeris → 5 Abfragen sind **keine** 5 unabhängigen Bestätigungen.
Echte Unterschiede entstehen nur durch **Einstellungen** (Zeitzone/Sommerzeit, Häusersystem,
mittlerer/wahrer Knoten, tropisch/siderisch).

Umsetzung (Lauras Wahl: Testsuite **und** Live-Gegenprüfung):
1. **Golden-Test-Suite** der Engine gegen wirklich unabhängige Autoritäten:
   NASA JPL Horizons + Astronomical Almanac/SE-Testvektoren + ein fixes astro.com-Referenzchart
   (alle Einstellungen gepinnt). Bogenminuten-genau.
2. **Konfigurations-Tests** (wo echte Bugs sitzen): Zeitzone/DST via IANA-Atlas, Häuserspitzen
   je System, Knotentyp.
3. **Live-Gegenprüfung pro Chart**: 1 externe Quelle gleich konfiguriert abfragen; bei
   Abweichung **warnen** (fängt v. a. Eingabe-/Zeitzonenfehler ab), nicht blockieren.

## Deutung (Text)

Es gibt **keinen** brauchbaren offenen, modernen, deutschen Deutungs-Korpus. Standard der
ganzen Branche: „saubere Chartdaten → LLM schreibt den Text". Deshalb:
- **Grounding:** exakte Fakten (Planet in Zeichen+Grad, Haus, Aspekte mit Orbis, Würden)
  als striktes JSON an Gemini; Regel „nur diese Fakten verwenden".
- **RAG (scoped):** Lauras kuratierte deutsche Bausteine (`knowledge`, pgvector) als Stil-/
  Tiefen-Schicht pro Stellung — überschreibt nie die berechneten Fakten.
- **Modell:** `gemini-3-flash` (Default; günstig, stark in Deutsch), `gemini-3.5-flash` für
  lange Premium-Reports. Aufruf serverseitig per REST aus der Edge Function, Key als Secret.
  (Hinweis: „Flash 3.0" existiert nicht als Name — echte IDs sind `gemini-3-flash`/`-3.5-flash`.)
- **Review-Gate (Pflicht):** Entwurf wird nie auto-veröffentlicht; Laura editiert pro Sektion,
  setzt auf `published`. Das ist zugleich die letzte Absicherung gegen Halluzination.

## Agenten/MCP/Plugins

Geprüft — nichts Produktionsreifes (Hobby-Projekte, oft AGPL; MCP ist für ein Server-Backend
die falsche Bauform). Entscheidung: **selbst komponieren** (Swiss Ephemeris + Gemini).

## Nächste Bausteine

1. Swiss-Ephemeris-WASM compute-Edge-Function + Golden-Test-Suite.
2. Edge Functions: `geocode`, `create-client`, `resolve-link` (Kundenlink → Chart + Transite + published Deutung).
3. Admin-Login (Supabase Auth) + Cockpit-UI (Kunden anlegen, Chart prüfen, Deutung reviewen).
4. `interpret`-Edge-Function (Gemini) — scharf, sobald `GEMINI_API_KEY` gesetzt ist.
5. Kunden-Ansicht über Magic-Link + Transit-Neuberechnung bei Aufruf.
