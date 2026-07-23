# loum Design System — Original-Tokens & Utility-Klassen

Kopiert am **2026-07-23** in dieses Repo. Nur neue Dateien — es wurde nichts
Bestehendes verändert (`src/index.css` und `tailwind.config.ts` sind unangetastet).

---

## ⚠️ Herkunft — bitte lesen

Geplant war der Abzug per `DesignSync` aus dem claude.ai-Projekt **VELA**
(`8b69e8cd-1561-4006-8d67-317c8242b0a9`), Pfad-Präfix
`_ds/loum-design-system-a4f6f690-ff05-4b15-bb03-57c15f03ef34/`.

**Das Tool `DesignSync` war in der Session nicht verfügbar.** Die Dateien stammen
deshalb aus dem lokal vorhandenen Original-Bundle:

```
/Users/laura/Downloads/files/loum_Design_System_CLEAN/
  tokens/*.css   → src/styles/loum/
  assets/*.svg   → src/assets/loum/
```

Dateidatum des Bundles: **2026-07-13**. Es enthält `SKILL.md` + `_ds_manifest.json`
und hat exakt die `tokens/` + `assets/`-Struktur, die der `_ds/`-Pfad erwarten lässt.
Inhaltlich ist es **QUINTESSENCE v6** (colors.css-Header: `v6 · 2026-07-07 · SSOT`)
inklusive Moon-CTA vom 2026-07-13 — das passt zum jüngsten Design-Commit des Repos
(`loum QUINTESSENCE v6: Design-System-Tokens, solide Karten, 4er-Bento, Moon-CTA (#97)`).

**Nicht verifiziert:** ob das claude.ai-Projekt exakt diesen Stand hat. Auf der
Platte liegen drei loum-DS-Kopien mit unterschiedlichen Prüfsummen; gewählt wurde
die vollständigste und neueste. Vor dem Umbau ggf. mit DesignSync gegenprüfen.

Alle Dateien sind **byte-identisch** kopiert (md5 verifiziert):

| Datei | md5 | Bytes |
|---|---|---|
| `fonts.css` | `3e345f962c29aeecdf40855c1b0e10ac` | 952 |
| `colors.css` | `404ff7888a23e7442f914260e553b8fd` | 17044 |
| `typography.css` | `6947cfb3eb2d2d2132c20bda425759cd` | 5447 |
| `spacing.css` | `5356c470a227fe3cd0f97765f7de2281` | 2280 |
| `elevation.css` | `96b007e498a32a550daca315baf0c6fb` | 3473 |
| `utilities.css` | `7b76a03bf163012e2bf7de41c440ca57` | 21156 |
| `../assets/loum/loum-signet.svg` | `45c9d715932ccd109120e7db86330531` | 1489 |
| `../assets/loum/loum-signet-gradient.svg` | `5e0df2228ddf2c58f3cdc601fabc593f` | 2808 |
| `../assets/loum/loum-wordmark-bone.svg` | `c91ade4b82d3ca71938442ed6eed4251` | 5455 |

### Fehlt

- **`zodiac-glyph-scorpio.svg`** (aus `uploads/`) — auf der Platte nirgends
  auffindbar. Es gibt ein unverwandtes `scorpio.svg` in Dropbox
  (`Stella's Safari/Inspiration CI/…`), das ist aber **nicht** dasselbe Asset und
  wurde bewusst nicht untergeschoben. Muss per DesignSync nachgeholt werden.
- PNG/GIF-Assets wurden auftragsgemäß nicht geholt (u. a. `loum-orb-idle.gif`,
  2,5 MB — liegt bei Bedarf im Bundle unter `assets/`).
- Nichts war abgeschnitten; alle sechs CSS-Dateien sind vollständig.

### Einbindungs-Reihenfolge

`fonts` → `colors` → `typography` → `spacing` → `elevation` → `utilities`.
`utilities.css` referenziert Variablen aus allen vier Token-Dateien.
`<body>` braucht `class="loum"`. Light Mode ist **strikt opt-in** über die Klasse
`.theme-light` — nie über ein `data-theme`-Attribut.

---

# INVENTAR — CSS-Klassen aus `utilities.css`

## 1 · Flächen & Karten

| Klasse | Wirkung |
|---|---|
| `.glass-surface` | **Die** loum-Karte: solider dunkler Fill (`--surface-card`), genau eine 1px-Inset-Hairline, `--r-lg`, **kein** backdrop-blur, **kein** äußerer Schatten. Tiefe kommt von innen. |
| `.glass-surface[data-variant="premium"]` | Hero-/Elevated-Fläche: tieferer Ink-Verlauf `#201D2C → --surface-hero → #17141F`, Inset-Hairline + zarter Top-Gloss. |
| `.glass-surface[data-variant="solid"]` | Opake Ink-Fläche für dichte Inhalte (`--void-900 → --void-950`), Blur explizit aus. |
| `.glass-surface[data-variant="aurora"]` | Solide dunkle Karte mit **scharfer irisierender Kantenlinie** (mint→violett) statt Wash. `isolation: isolate`. |
| `.loum-card__aurora` | Innerer Layer der Aurora-Karte: schwacher, gleichmäßiger Aura-Fleck unten rechts (blur 30px, `plus-lighter`), z-index 0. |
| `.loum-card__body` | Content-Wrapper über der Aura, z-index 1. Zwingend, sonst verschluckt die Aura den Text. |
| `.glass-overlay` | Schwebende UI (Menü/Popover): dunkles Rauchglas `rgba(10,10,16,.66)` + `--blur-ui` + Hairline-Border. Nicht weiß-alpha. |
| `.edge-iridescent` | 1px-Verlaufskante mint→violett per `::after` + Mask-Trick. Auf Karten/Tarot-Karten legen. |
| `.underglow` | Violetter Volumen-Unterglow per `::before` (blur 24px, z-index −1) unter schwebende Stapel/Karten. |

## 2 · Typografie

| Klasse | Wirkung |
|---|---|
| `.t-display` | Cinzel Regular 400, `clamp(2.875rem, 6.6vw, 6.25rem)`, UPPERCASE, −3%. **Flach** — kein Glow, kein Verlauf. |
| `.t-h1` | Cinzel Regular 400, `clamp(2.25rem, 4.4vw, 4rem)`, UPPERCASE, lh 1.1. |
| `.t-h2` | Cinzel Regular 400, `clamp(1.75rem, 3vw, 2.75rem)`, UPPERCASE, lh 1.14. |
| `.t-h3` | Bricolage Grotesque 600, `clamp(1.5rem, 2.2vw, 2rem)`, −0.015em. |
| `.t-h4` | Bricolage Grotesque 500, `clamp(1.375rem, 1.65vw, 1.5rem)`. |
| `.t-h5` | Bricolage Grotesque 600, 18px. |
| `.t-lead` | Bricolage 400, 19px / lh 1.65, `--fg-soft`. Lede-Absatz. |
| `.t-body` | Bricolage 400, 17px / lh 1.6, `--fg-soft`. Standard-Fließtext. |
| `.t-body-sm` | Bricolage 400, 15.5px / lh 1.55, `--fg-soft`. |
| `.t-meta` · `.eyebrow` · `.timestamp` · `.meta` · `.annotation` · `.mono` | **Eine identische Regel:** Bricolage 500, 12.5px, UPPERCASE, tracking `.18em`, `--fg-mute`. |
| `.highlight` | **Das „lit word".** Cinzel Decorative 400, UPPERCASE, −9%, `margin: 0 .08em`, bone + `--glow-lit`. Das **einzige** Text-Element mit Glow. |
| `.highlight.gr` | Lit word in mystic-grün getönt, Glow bleibt. |
| `.highlight.ir` | Lit word in aura/iris getönt, Glow bleibt. |
| `.card-name` | Tarot-Kartenname: Cinzel Decorative 400, UPPERCASE, `--tracking-card-name: 0`, trägt `--glow-lit`. |
| `.pull-quote` | Rituelle Aussage (Reading Essence): Cinzel Regular, −3%, `--fg-ritual` (neutrales Grau 50%). Flach. |
| `.t-glow` | Setzt `text-shadow: var(--glow-lit)`. Nur auf lit word / card-name / Wordmark — **nie** auf eine ganze Headline. |
| `.emotion` | Lit Emphasis ohne Face-Wechsel: Bricolage 600, `font-style: normal`. |
| `.text` · `.text-soft` · `.text-mute` | Vordergrund-Rampe: `--fg` / `--fg-soft` (85%) / `--fg-mute` (mist 55%). |
| `.c-green` `.c-pink` `.c-iris` `.c-teal` `.c-amber` `.c-rose` `.c-azure` | Akzentfarben: mystic · orchid · aura · iris · solar · fuchsia · azure. |

**Stillgelegt (nur für Alt-Markup, rendern als solides bone):** `.t-gradient`,
`.highlight.grad`. Text trägt im System **nie** einen Verlauf.

## 3 · Hintergrund & Atmosphäre

| Klasse | Wirkung |
|---|---|
| `.loum-starfield` | **Der Sternenhimmel — auf jedem Screen.** Full-bleed absoluter Layer hinter dem Content. Drei Ebenen: statischer Mikro-Staub (140px-Kachel) + `::before` (helle Sterne, drift 120s) + `::after` (feine Sterne, drift 200s reverse). |
| `.loum-aurora` | Hero-/Final-CTA-Wash: iris + mystic + orchid Radials, `plus-lighter`, blur 28px, opacity .5. Additives Licht. |
| `.loum-vault` | Quintessenz-/Reading-Wash: ruhig, von oben, nach innen. iris + iris-teal, blur 32px, opacity .55. |
| `.loum-field` | Card-Draw-Wash: geerdet, von unten beleuchtet. mystic + teal, blur 30px, opacity .5. |
| `.orb` | Halo-Orb Standard auf dunklem Kontext: `mix-blend-mode: lighten`. |
| `.orb--on-black` | Für reines `#000`: `hard-light`. |
| `.orb--on-color` | Auf Aurora/hell: `screen` + brightness 1.08 / saturate 1.15 / contrast 1.08. |

**Keyframes:** `loum-drift` (Sterndrift) · `loum-breath` (Orb-Atem, scale 1→1.06,
4200 ms; mobil 6720 ms) · `loum-float` (Karten schweben −3px, 4 s, gestaffelt) ·
`loum-rise` (Standard-Entrance: opacity 0 + translateY 14px → 0).

## 4 · Zustände

| Selektor | Wirkung |
|---|---|
| `.glass-surface[data-interactive="true"]` | Schaltet Interaktivität frei: `cursor: pointer`, `outline: none`. |
| `…:hover` (auch `:has(> button:hover, > a:hover)`) | Lift `translateY(-2px)`, Hairline heller (.07 → .12), Top-Border auf `rgba(bone,.22)`. |
| `…:focus-visible` | loum-Grünring über `--shadow-focus` zusätzlich zur Hairline. |
| `…:active` | Press: `translateY(-1px) scale(.992)`. |
| `[data-variant="premium"][data-interactive]:hover` | Hairline .10 → .14, Top-Gloss .06 → .09. |
| `[data-variant="aurora"]:hover::after` | Irisierende Kante `opacity .85 → 1`. |
| `[data-variant="aurora"]:hover .loum-card__aurora::before` | Aura-Fleck `opacity .5 → .72`. |
| `::selection` | Auswahl in `--selection` (mystic 35%). |
| `@media (prefers-reduced-motion: reduce)` | Stoppt Sterndrift sowie `.orb-breath` und inline gesetzte `loum-breath` / `loum-float`. |

## 5 · Buttons / CTA

| Klasse | Wirkung |
|---|---|
| `.btn-moon` | **Der Main-CTA seit 2026-07-13.** Weiße Fläche, `border-radius: 19px`, dunkler Text `#111019`, weicher iris-Schatten `0 8px 20px rgba(167,139,250,.25)`. Hover: `brightness(.96)` + stärkerer Schatten. Active: `translateY(1px)`. |
| `.btn-glow` / `.btn-prisma` | Sekundäre/Halo-Behandlung: dunkles Rauchglas-Pill mit **violettem Glow von unten** + weißer 1px-Inset-Kante. Identische Regel für beide Namen. **Nie** grüne oder pinke Füllung. Der konische Regenbogen-Halo ist stillgelegt (`::before { content: none }`). |

## 6 · Layout-Helfer & Basis

| Selektor | Wirkung |
|---|---|
| `body.loum` | Pflicht-Klasse: `--color-void` als Hintergrund, `--fg`, `--font-rational` (Bricolage), 17px / lh 1.55, antialiased, `optimizeLegibility`. |
| `*, *::before, *::after` | `box-sizing: border-box`. |
| `.t-display, .t-h1…h5, .pull-quote, .card-name, .t-lead` | `text-wrap: balance`. |
| `.t-body, .t-body-sm` | `text-wrap: pretty`. |
| `.theme-light` | (aus `colors.css`) Light Mode — **nur** per Klasse, bewusst kein `[data-theme]`-Selector, damit Host-Apps den Dark-Default nicht kippen. |

---

# CSS-Variablen — die wichtigsten

## Farb-Primitives (10 Rampen × 11 Stufen) — 400er-Seeds

| Rampe | Rolle | 400 |
|---|---|---|
| `--mystic-*` | pulse / CTA / success | `#20F0D0` |
| `--orchid-*` | voice / highlight / emotion | `#DA8FFF` |
| `--aura-*` | depth / große Arkana | `#A78BFA` |
| `--iris-*` | strom / info | `#789DFF` |
| `--azure-*` | dialog (KI/Chat) — neu in v6 | `#5599FF` |
| `--celestial-*` | sky / links | `#5EB5F7` |
| `--solar-*` | warn / Stäbe | `#FFAC89` |
| `--fuchsia-*` | Kelche / danger | `#F262B5` |
| `--void-*` | Flächen | `--void-950: #111019` |
| `--moon-*` | Lavendel-Grautöne | `#CFCDE0` |

**void-Rampe (die Flächen-Treppe):**
`--void-950 #111019` (Page) · `--void-900 #1A1829` (Card) ·
`--void-800 #222232` (nested) · `--void-700 #2E3140` (raised / border-strong).
`#080610` ist in v6 **tot**.

## Semantische Farben & Flächen

```
--bg-canvas      var(--void-950)   /* Page          */
--bg-primary     var(--void-900)   /* Section/Card   */
--bg-secondary   var(--void-800)   /* nested surface */
--bg-surface     var(--void-700)   /* raised surface */

--surface-card     linear-gradient(180deg, #16161F 0%, #12121D 100%)
--surface-card-top #16161F
--surface-card-bot #12121D
--surface-hero     #1B1926
--card-hairline    rgba(255,255,255,0.07)   /* die EINZIGE Kante */

--text-primary   #F8F7F2                    /* bone */
--text-secondary #FBFAFF
--text-muted     rgba(238,245,248,.55)      /* mist 55% */
```

**Vordergrund-Rampe:**
`--fg` = bone · `--fg-soft` bone 85% · `--fg-mute` mist 55% · `--fg-low` bone 35% ·
`--fg-faint` bone 22% · `--fg-ritual` `rgba(217,217,217,.5)`.

**Hairlines:** `--hairline` bone 10% · `--hairline-soft` bone 6%.

**Legacy-Aliase (überall im Markup in Gebrauch):**
`--color-green` → mystic-400 · `--color-pink` → orchid-400 · `--color-iris` → aura-400 ·
`--color-teal` → iris-400 · `--color-blue` → azure-400 · `--color-amber` → solar-400 ·
`--color-rose` → fuchsia-300 · `--color-bone` → `--text-primary` ·
`--color-void` / `--color-ink` / `--color-surface` / `--color-border` → void-950/900/800/700.

**RGB-Tripel für `rgba()`** (literal, wichtig für alle Glows/Washes):
`--rgb-green 32,240,208` · `--rgb-pink 218,143,255` · `--rgb-iris 167,139,250` ·
`--rgb-teal 120,157,255` · `--rgb-azure`/`--rgb-blue 85,153,255` ·
`--rgb-amber 255,172,137` · `--rgb-rose 255,130,202` · `--rgb-bone 248,247,242` ·
`--rgb-mist 238,245,248` · `--rgb-void 17,16,25`.

**Fill-Skalen** (je 4–5 Stufen à 4 / 6–7 / 8,5–12 / 20 %):
`--fill-bone-1…5`, `--fill-green-1…4`, `--fill-pink-1…4`, `--fill-iris-1…4`,
`--fill-teal-1…4`, `--fill-azure-1…4`, `--fill-amber-1…4`, `--fill-rose-1…4`,
`--fill-destructive-1…4`. Dazu `--tone-fill-*` (= Stufe 4) und `--tone-edge-*` (30 %).

## Verläufe — genau drei

```
--grad-bezel   linear-gradient(90deg,  #BBA8FF 0%, #2AEAD3 100%)   /* Rahmen/Ringe */
--grad-aurora  linear-gradient(108deg, #FFAC89 0%, #F262B5 48%, #789DFF 100%)  /* nur FLÄCHE */
--grad-halo    linear-gradient(135deg, #5599FF 0%, #7241FF 100%)   /* KI/Dialog  */
```

Plus `--grad-prisma` (konische Bezel-Form für CTA-Ringe) und die reinen Aliase
`--grad-signature` / `--grad-bloom` / `--grad-convergence` / `--grad-dawn`.
**Aurora nie auf Text.**

Effekt-Verläufe:
`--edge-iridescent` (135deg, green 55% → transparent → iris 65%) ·
`--underglow-iris` (radial 60%/100% at 50% 100%, iris 35% → transparent).

## Radien

```
--r-sm    .375rem   /*  6px */
--r-md    .625rem   /* 10px — DEFAULT, dezent */
--r-lg    .875rem   /* 14px — Inputs, Surfaces; = --radius */
--r-xl    1.125rem  /* 18px — Cards */
--r-2xl   1.5rem    /* 24px — Screens */
--r-pill  9999px    /* nur CTAs / Prisma-Capsule */
```

`.btn-moon` weicht bewusst ab und setzt `19px` hart.

## Schatten, Glows & Blur

```
--shadow-card    0 4px 24px rgba(0,0,0,.40)
--shadow-lift    0 30px 60px -30px rgba(0,0,0,.65)
--shadow-focus   0 0 0 3px rgba(var(--rgb-green),.22)
--shadow-modal   0 2rem 5rem rgba(0,0,0,.65),   0 0 0 1px var(--hairline)
--shadow-sheet   0 1.5rem 4rem rgba(0,0,0,.55), 0 0 0 1px var(--hairline)
--shadow-popover 0 1rem 2.5rem rgba(0,0,0,.45), 0 0 0 1px var(--hairline)
--shadow-tooltip 0 .5rem 1.5rem rgba(0,0,0,.50)

--glow-green / --glow-pink / --glow-iris   0 0 1.25rem rgba(<farbe>,.35)
--glow-destructive                          0 0 1.25rem rgba(destructive,.45)
--glow-lit   0 0 .16em rgba(bone,.55), 0 0 .4em rgba(bone,.2)
             /* seit 2026-07-13 dezenter; im Light Mode = none */
--ring-cta   0 0 0 1px rgba(green,.55), 0 0 28px rgba(green,.20)

--blur-ui     blur(16px) saturate(140%)   /* kleine UI  */
--blur-glass  blur(28px) saturate(180%)   /* große Karten */
--blur-modal  blur(8px)                   /* Backdrops  */
```

Als **vollständige Filter-Funktion** benutzen: `backdrop-filter: var(--blur-glass)` —
nicht `blur(var(--blur-glass))`.
`--glass-depth-shadow` ist in v6 ein transparenter No-Op: loum-Karten haben
**keinen** äußeren Drop-Shadow.

## Spacing & Maße

```
rem-Skala   --s-1 .25rem · --s-2 .5 · --s-3 .75 · --s-4 1 · --s-5 1.5
            --s-6 2 · --s-7 3 · --s-8 4 · --s-9 6 · --s-10 8

4px-Rampe   --sp-1 4px · --sp-2 8 · --sp-3 12 · --sp-4 16 · --sp-5 20
            --sp-6 24 (Card-Padding) · --sp-8 32 (Card→Card) · --sp-10 40
            --sp-12 48 · --sp-16 64 (Default-Rhythmus) · --sp-20 80 · --sp-24 96

Breiten     --w-narrow 30rem · --w-default 45rem · --w-wide 62.5rem · --w-max 75rem
Höhen       --h-sm 36px · --h-md 40px · --h-lg 44px · --ctrl-md 18px
Switch      --switch-w 36px · --switch-h 20px · --switch-knob 14px
```

## Typografie-Tokens

**Familien** (alle via Google-Fonts-`@import` in `fonts.css`):

```
--f-display       "Cinzel", ui-serif, Georgia, serif          /* Basis-Display, FLACH */
--f-display-deco  "Cinzel Decorative", "Cinzel", ui-serif     /* das lit word + card-names */
--f-ui            "Bricolage Grotesque", ui-sans-serif        /* alles andere */
--f-mono          ui-monospace, SFMono-Regular, …
```

Aliase: `--font-emotional` → `--f-display` · `--font-rational` / `--font-ritual` /
`--font-sans` / `--font-ui` → `--f-ui`.
`--f-serif` und `--f-sans` sind stillgelegt (Cormorant, Inter und DM Sans sind raus).

**Größen:** `--fs-display clamp(2.875rem, 6.6vw, 6.25rem)` ·
`--fs-h1 clamp(2.25rem, 4.4vw, 4rem)` · `--fs-h2 clamp(1.75rem, 3vw, 2.75rem)` ·
`--fs-h3 clamp(1.5rem, 2.2vw, 2rem)` · `--fs-h4 clamp(1.375rem, 1.65vw, 1.5rem)` ·
`--fs-h5 18px` · `--fs-lede 19px` · `--fs-body 17px` · `--fs-body-sm 15.5px` ·
`--fs-code 13.5px` · `--fs-meta 12.5px` · `--fs-micro 11.5px`.

**Line-Height:** `--lh-display 1.06` · `--lh-h1 1.1` · `--lh-h2 1.14` ·
`--lh-h3 1.15` · `--lh-h4 1.25` · `--lh-h5 1.3` · `--lh-body 1.55` · `--lh-prose 1.6`.

**Tracking:** `--tracking-display -0.03em` (Cinzel Regular) ·
`--tracking-display-deco -0.09em` (das lit word) · `--tracking-meta .18em` ·
`--tracking-meta-wide .26em` · `--tracking-h3 -0.015em` · `--tracking-h4 -0.01em` ·
`--tracking-card-name 0` · `--tracking-h1` / `--tracking-h2` / `--tracking-body` = 0.

**Absatzabstände:** `--para-h1 48px` · `--para-h2 28` · `--para-h3 24` ·
`--para-h4 20` · `--para-lede 18` · `--para-body 16` · `--para-body-sm 14` ·
`--para-mini 12`.

**Gewichte:** `--weight-regular 400` · `--weight-medium 500` ·
`--weight-semibold 600` · `--weight-bold 700`.

## Motion

```
--e-out     cubic-bezier(.22, 1, .36, 1)      /* = --ease-out    */
--e-spring  cubic-bezier(.34, 1.56, .64, 1)   /* = --ease-spring */

--d-quick .18s · --d-fast .16s · --d-base .25s · --d-slow .45s · --d-glacial .7s
--t-micro 120ms · --t-fast 200ms · --t-base 300ms · --t-slow 450ms · --t-reveal 700ms
```

## shadcn-Bridge

`colors.css` mappt zusätzlich `--background`, `--foreground`, `--card`,
`--card-foreground`, `--popover`, `--popover-foreground`, `--primary`
(= mystic), `--primary-foreground`, `--secondary`, `--muted`, `--accent`,
`--destructive`, `--border`, `--input`, `--ring` (= mystic) auf die loum-Tokens.

---

## Die zehn Regeln in Kurzform

Aus `SKILL.md` des Bundles — das sind die Leitplanken für den Umbau:

1. `loum` ist **immer** kleingeschrieben.
2. **Dark by default**, `void-950 #111019`. Light nur via `.theme-light`.
3. Co-equal Primaries: mystic `#20F0D0` (pulse/CTA) + orchid `#DA8FFF` (voice).
   Genau drei Verläufe: Bezel · Aurora (nur Fläche) · Halo.
4. Der CTA ist die weiße Moon-Kapsel (`.btn-moon`) — **nie** eine pinke Füllung.
5. Zwei Display-Cuts + eine UI-Face: Cinzel Regular · Cinzel Decorative · Bricolage
   Grotesque. Kein Cormorant, kein Inter, kein DM Sans.
6. **Kein Italic im System.** Emphasis = das lit word (`.highlight`). Kein Text-Verlauf.
7. Flächen sind `.glass-surface`; Radien dezent (`--r-md` 10px), Pill nur für CTAs/Chips.
8. **Jeder Screen hat `.loum-starfield`**; Hero-/CTA-Momente ergänzen `.loum-aurora`.
9. Der Halo-Orb ist Ringe + Kern-Glow, nie eine gefüllte Kugel; immer `.orb`
   (`mix-blend-mode: lighten`).
10. Der Glow sitzt **nie** auf einer ganzen Headline — nur auf dem lit word.
