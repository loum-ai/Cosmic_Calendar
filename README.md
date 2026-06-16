# Vela 🌌

Vela ist ein dunkler, kosmischer Begleiter für dein Geburtshoroskop — in
Klartext erklärt, ohne Fachjargon. Diese App entsteht aus einem Claude-Design-
Entwurf (`vela.dc.html`) und wird hier als echte, deploybare Web-App umgesetzt.

> **Status: Phase 1 — Gerüst & Shells.** Alle fünf Tabs, das globale Design-
> System (Tailwind + shadcn-Primitives + Framer Motion), die Tap-to-understand-
> Sheets und die „Frag dein Horoskop"-Q&A stehen. Pixel-genaue Ausarbeitung
> jedes Screens folgt in Phase 2 (siehe unten).

## Stack

- **Vite + React + TypeScript** (SPA)
- **Tailwind CSS** mit den Vela-Design-Tokens (`tailwind.config.ts`)
- **shadcn/ui** — nur als headless Primitives (Dialog, Sheet, Button, Input),
  vollständig im Vela-Look gestylt. **Kein Material-/Flat-Design.**
- **Framer Motion** für Screen-Übergänge, Sheets und Mikro-Interaktionen
- **zustand** für den App-State
- **Vercel Serverless Function** (`api/ask.ts`) als sicherer Proxy für die
  Claude-API (der API-Key bleibt serverseitig)

## Lokal entwickeln

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Typecheck + Production-Build nach dist/
npm run preview    # gebauten Build lokal ansehen
```

Für die Q&A lokal: `ANTHROPIC_API_KEY` setzen und `vercel dev` nutzen (siehe
[`DEPLOY.md`](./DEPLOY.md)). Ohne Key fällt die Q&A elegant auf einen Hinweis
zurück.

## Architektur

```
src/
  components/        globales Shell + wiederverwendbare Bausteine
    AuroraBackground, Starfield   – der kosmische Hintergrund (überall gleich)
    TabBar, ScreenShell           – Navigation + einheitliche Screen-Hülle
    GlassPanel, IridescentOrb     – die „Glas/Chrom"-Effekte (nicht flach)
    Explainable, SheetHost        – universelles Tap-to-understand
    Composer                      – „Frag dein Horoskop" (auf jedem Tab)
    KlartextToggle, CoachHint     – UX-Verbesserungen aus dem Audit
    ui/                           – shadcn-Primitives (restyled)
  screens/           Heute · Transite · Synastrie · Lernen · Profil
  lib/               tokens, data (Beispiel-Chart), sheets, glossary
  store/             zustand-Store
api/ask.ts           Claude-Q&A-Proxy (Vercel)
```

## Warum ein eigenes Repo?

Vela lebt bewusst in `loum-ai/Cosmic_Calendar` — **getrennt vom loum-Haupt-
Repo**. Deploy läuft über ein eigenständiges Vercel-Projekt, das nur an dieses
Repo gebunden ist. So geht Vela live, **ohne das loum-Repo zu berühren**.

## Phase 2 (offen)

Pixel-genaue Ausarbeitung jedes Screens, das voll interaktive Geburtsrad,
das Synastrie-Doppelrad, vollwertige Transit-Artworks, echte Ephemeriden-
Berechnung statt Beispieldaten und lokale Persistenz.

Siehe [`AUDIT.md`](./AUDIT.md) für die UX-Punkte, die wir gezielt beheben.
