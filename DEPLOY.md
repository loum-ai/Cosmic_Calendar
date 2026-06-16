# Vela live schalten — isoliert vom loum-Repo

Vela wird als **eigenständiges Vercel-Projekt** deployed, das **nur** an das
Repo `loum-ai/Cosmic_Calendar` gebunden ist. Das loum-Haupt-Repo wird dabei
zu keinem Zeitpunkt berührt, importiert oder verändert.

## Einmalig: Vercel-Projekt anlegen

1. Auf [vercel.com](https://vercel.com) einloggen → **Add New… → Project**.
2. **Import** `loum-ai/Cosmic_Calendar` (nur dieses Repo auswählen).
3. Vercel erkennt **Vite** automatisch:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - (beides ist bereits in `vercel.json` hinterlegt)
4. Unter **Environment Variables** setzen:
   - `ANTHROPIC_API_KEY` = dein Claude-API-Key (für die Q&A)
   - optional `ANTHROPIC_MODEL` (Default: `claude-sonnet-4-6`)
5. **Deploy** klicken.

Danach deployt jeder Push auf `main` automatisch nach Production; Pushes auf
andere Branches (z. B. `claude/vela-design-impl-nbuip2`) erzeugen Preview-
Deployments. Die Serverless-Function `api/ask.ts` wird automatisch als
`/api/ask` bereitgestellt.

## Lokal mit Q&A testen

```bash
npm i -g vercel        # einmalig
vercel link            # an das Cosmic_Calendar-Projekt binden
vercel env pull        # ANTHROPIC_API_KEY nach .env ziehen
vercel dev             # App + /api/ask lokal
```

Ohne Key läuft die App normal; nur die Q&A zeigt einen Hinweis statt einer
echten Antwort.

## Warum das loum-Repo sicher ist

- Eigenes Repo, eigenes Vercel-Projekt, eigene Domain.
- Keine Imports oder Submodule aus dem loum-Repo.
- Der Claude-Key liegt ausschließlich in den Vercel-Env-Vars dieses Projekts.
