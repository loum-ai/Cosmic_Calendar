import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GenerativeLoader } from "@/components/GenerativeLoader";
import { ChartWheel } from "@/components/ChartWheel";
import { ArrowLeft, ChevronRight, CircleDot, Hexagon, Info, Sparkles, X } from "lucide-react";
import { THEMES, themeByKey, type LifeTheme } from "@/lib/themes";
import { ASC, CHART, PROFILE, TRANSITS, signName, houseOf, HOUSE, IS_DEMO } from "@/lib/data";
import { IridescentOrb } from "@/components/IridescentOrb";
import { resolveSheet } from "@/lib/sheets";
import { computeHumanDesign } from "@/lib/humandesign";
import { chartContext, chartHash, shortHash, transitContext } from "@/lib/factsContext";
import { subjectTask, useReading, storedReading } from "@/lib/genReadings";
import { aiPortrait } from "@/lib/interpret";
import { retry } from "@/lib/retry";
import { supabase, AI_MODEL_CORE } from "@/lib/supabase";
import type { BirthInput } from "@/lib/compute";
import { Reveal } from "@/components/Reveal";
import { useApp, DEMO_BIRTH } from "@/store/useApp";

/** The theme reading is generated in FIVE focused, parallel, individually
 *  cached calls: a short flowing intro + four accordion sections. One call per
 *  section keeps each text tight (no wall of text, no repetition) and lets the
 *  page load progressively. The mechanism is identical for EVERY life theme
 *  (PRINZIPIEN §1 — no theme is privileged); the lens does the specialising. */
const COMMON_RULES = `Sprich mit „du", warm, klar, ehrlich. Kein Satz darf in jedes Horoskop passen — jeder Satz folgt aus DIESEN Fakten. Erwähne nur die Stellungen, die für genau diesen Abschnitt nötig sind — keine allgemeine Chart-Zusammenfassung, keine Wiederholungen. Fachbegriffe sofort übersetzen. Da das Geschlecht der Person nicht aus den Fakten hervorgeht: formuliere geschlechtsneutral (z. B. „in der Osteopathie arbeiten" statt „als Osteopathin", „eine schützende Rolle" statt „als Beschützerin"). Kein Markdown, keine Sternchen, keine Überschriften — nur Fließtext und ggf. nummerierte Zeilen. Absätze durch Leerzeilen trennen. KOMPAKT: Schreibe dicht — jeder Satz trägt neue Information, keine Füllsätze, nichts doppelt in anderen Worten. Lieber ein starker Satz als drei mittelmäßige. TONFÄRBUNG: Sachlich-geerdet, wie ein kluger Berufs- und Lebensberater, der Astrologie als präzises Werkzeug nutzt — nicht wie ein Mystiker. Alltagssprache statt Seelen-Vokabular: VERMEIDE Wörter wie „Seele", „heilig", „Bestimmung", „Schicksal", „Energien", „Universum", „spirituell", „Erwachen", „Dunkelheit", „verborgene Kräfte", „Transformation". Sprich stattdessen von Bedürfnissen, Mustern, Stärken, konkretem Verhalten und Situationen. Tiefe ja — aber am Alltag belegt, nie raunend. Warm und klar, ohne Pathos.`;

function introTask(t: LifeTheme): string {
  return `Schreibe NUR den EINSTIEG einer Deutung zum Lebensthema „${t.label}" (${t.teaser}) für DIESEN Menschen — genau 2 kurze Absätze (je 2–3 Sätze), ohne Überschrift.
Linse: ${t.lens}
Inhalt: der rote Faden dieses Themas bei diesem Menschen — sofort persönlich, etwas Wahres über IHN, kein Vorgeplänkel. NOCH KEINE Details zu Lebensphasen, konkreten Empfehlungen oder der zentralen Spannung — die folgen in eigenen Abschnitten.
${COMMON_RULES}`;
}

const THEME_SECTIONS: { key: string; title: string; v?: string; task: (t: LifeTheme) => string }[] = [
  {
    key: "kraefte",
    v: "3",
    title: "Was in dir wirkt",
    task: (t) => `Schreibe NUR den Abschnitt „Was in dir wirkt" einer Deutung zum Lebensthema „${t.label}" für DIESEN Menschen — 2–3 kompakte Absätze (je 2–4 Sätze).
Linse: ${t.lens}
Inhalt: die 2–3 tragenden Kräfte für dieses Thema, als Geschichte verwoben. Erkläre dabei NACHVOLLZIEHBAR, WARUM genau diese Stellungen dieses Thema prägen (z. B. warum dieses Haus für diesen Lebensbereich steht) — die Verbindung erklären, nicht behaupten; nichts voraussetzen.
FORM: Beginne JEDEN Absatz mit 2–4 prägnanten Leitworten und einem Gedankenstrich („Leitworte — dann der Absatz…"), damit der Text scannbar ist.
${COMMON_RULES}`,
  },
  {
    key: "phasen",
    v: "3",
    title: "Deine Lebensabschnitte",
    task: (t) => `Schreibe NUR den Abschnitt „Deine Lebensabschnitte" einer Deutung zum Lebensthema „${t.label}" für DIESEN Menschen — genau 3 kompakte Absätze (je 2–3 dichte Sätze).
Linse: ${t.lens}
Inhalt: wie sich dieses Thema über das Leben ENTWICKELT — was früh da ist, was in der Lebensmitte reift, was in den reifen Jahren trägt. Mach es an Saturn, den langsamen Planeten und den Mondknoten fest.
FORM: GENAU drei Absätze, jeder beginnt mit der Altersspanne und einem Gedankenstrich: „Bis 29 — …", „30 bis 45 — …", „Ab Mitte 40 — …".
${COMMON_RULES}`,
  },
  {
    key: "jetzt",
    v: "3",
    title: "Gerade jetzt",
    task: (t) => `Schreibe NUR den Abschnitt „Gerade jetzt" einer Deutung zum Lebensthema „${t.label}" für DIESEN Menschen — genau 2 kompakte Absätze (je 2–4 Sätze).
Linse: ${t.lens}
Inhalt: Nutze die AKTUELLEN TRANSITE aus den FAKTEN. Wähle die 1–2 laufenden Entwicklungen, die DIESES Thema jetzt am spürbarsten berühren (langsame Planeten zuerst — sie tragen die echten Entwicklungen). Erkläre in einem Halbsatz, was ein Transit ist (der laufende Himmel berührt einen Punkt deines Geburtsbilds). Sag, was diese Entwicklung für die kommenden Monate bedeutet und was JETZT ein guter, konkreter Schritt ist. Nüchtern-warm: keine Dramatik, keine Heilsversprechen.
FORM: Beginne JEDEN Absatz mit 2–4 prägnanten Leitworten und einem Gedankenstrich („Leitworte — dann der Absatz…"), damit der Text scannbar ist.
${COMMON_RULES}`,
  },
  {
    key: "konkret",
    v: "2",
    title: "Konkret: was zu dir passt",
    task: (t) => `Schreibe NUR den Abschnitt „Konkret: was zu dir passt" einer Deutung zum Lebensthema „${t.label}" für DIESEN Menschen.
Linse: ${t.lens}
Viele Menschen SUCHEN in diesem Thema noch — sie haben ihre Richtung oder Passion nicht gefunden. Nimm diese Suche ernst, ohne Plattitüden, und würdige, was vermutlich schon da ist, statt Bisheriges zu entwerten.
GENAU 4–5 nummerierte Punkte im Format „1. …" (jeder Punkt eine eigene Zeile, genau 2 knappe Sätze — fasse dich je Punkt kurz). Denke BREIT über Lebenswelten — handwerklich-gestaltend, technisch, körperlich/draußen, führend-organisierend, beratend-menschlich, kaufmännisch, kreativ, heilend — und wähle die, die WIRKLICH aus diesem Chart folgen, nicht reflexhaft Schreibtisch- und Beraterberufe. Beim Thema Berufung heißt das konkrete Berufsfelder und Rollen; bei Beziehungsthemen konkrete Muster und Bedürfnisse; sinngemäß für jedes andere Thema.
JEDER Punkt nennt: was es ist → WARUM es zu diesem Chart passt (die Stellung) → WORAUF es einzahlt (welches Bedürfnis oder Potenzial es nährt) → woran die Person im Alltag merkt, dass es trägt.
${COMMON_RULES}`,
  },
  {
    key: "weg",
    v: "3",
    title: "Deine Spannung & dein Weg",
    task: (t) => `Schreibe NUR den Abschnitt „Deine Spannung & dein Weg" einer Deutung zum Lebensthema „${t.label}" für DIESEN Menschen — genau 3 kompakte Absätze (je 2–4 kurze Sätze).
Linse: ${t.lens}
Inhalt: Wähle die DEUTLICHSTE Spannung am Chart (der konkrete Aspekt) und formuliere sie als Beobachtung mit Spielraum („Eine der deutlichsten Spannungen bei dir …") — nicht als einzige Wahrheit; nenne kurz eine ZWEITE Facette, die ebenfalls hineinspielt. Benenne bei der Schwierigkeit auch die Stärke darin. Dann die Richtung: der Nordknoten als Wachstumsrichtung (eine wählbare Entwicklung, kein festgelegtes Los), der Südknoten als das Vertraute, das gewürdigt und langsam gelockert werden darf. Der letzte Satz soll bleiben und Mut machen.
FORM: Beginne JEDEN Absatz mit 2–4 prägnanten Leitworten und einem Gedankenstrich („Leitworte — dann der Absatz…"), damit der Text scannbar ist.
${COMMON_RULES}`,
  },
];

/**
 * Themen-Hub — the calm home (per the product briefing). Instead of dumping the
 * whole chart, the user picks a LIFE-THEME; the same chart is then read through
 * that lens. The full birth chart is one tap away. This replaces the data-dump
 * home so a newcomer is never overwhelmed.
 */
export function ThemenHub() {
  const openTheme = useApp((s) => s.openTheme);
  const setHomeView = useApp((s) => s.setHomeView);
  const activeTheme = useApp((s) => s.activeTheme);
  const viewer = useApp((s) => s.viewerMode);
  const savedBirth = useApp((s) => s.savedBirth);
  const hdBirth = useApp((s) => s.hdBirth);
  const aiLoading = useApp((s) => s.aiLoading);
  const aiVersion = useApp((s) => s.aiVersion);
  void aiVersion; // re-render when the reading lands
  const birth: BirthInput | null = savedBirth ?? hdBirth ?? (IS_DEMO ? DEMO_BIRTH : null);
  const openInfo = useApp((s) => s.openInfo);
  const setTab = useApp((s) => s.setTab);
  const portrait = aiPortrait();
  const portraitParas = portrait ? portrait.split(/\n\n+/).map((s) => s.trim()).filter(Boolean) : [];

  // "Kurz gesagt" — schließbare Klartext-Karte über dem Rad (Konzept ChartHome)
  const [kurz, setKurz] = useState(true);
  const sunP = CHART.find((p) => p.key === "sun");
  const moonP = CHART.find((p) => p.key === "moon");
  const acSign = signName(ASC);
  const kurzText = `Außen ${acSign}: so wirkst du, bevor du etwas sagst. Innen ${sunP ? signName(sunP.lon) : "—"}-Sonne und ${moonP ? signName(moonP.lon) : "—"}-Mond. Tipp irgendetwas an — alles hier erklärt sich.`;

  // Element-/Modus-Dominanz aus den echten Ständen (Kachel-Grid „Auf einen Blick")
  const signIdx = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30);
  const ELEMS = ["Feuer", "Erde", "Luft", "Wasser"];
  const MODES = ["Kardinal", "Fix", "Veränderlich"];
  const MODE_SUB: Record<string, string> = { Kardinal: "beginnt", Fix: "hält", Veränderlich: "wandelt" };
  const eCount = [0, 0, 0, 0];
  const mCount = [0, 0, 0];
  for (const p of CHART) { const i = signIdx(p.lon); eCount[i % 4]++; mCount[i % 3]++; }
  const eMax = eCount.indexOf(Math.max(...eCount));
  const mMax = mCount.indexOf(Math.max(...mCount));
  const t0 = TRANSITS[0];
  const t0Aspect = t0?.title.match(/Trigon|Quadrat|Opposition|Sextil|Konjunktion/)?.[0] ?? "heute";
  const t0Glyph = CHART.find((p) => p.key === t0?.nk)?.glyph ?? "";

  // Start with the QUESTION, not the structure: on a client's first visit ask
  // "Was beschäftigt dich gerade?" — picking a theme routes straight into it,
  // or they skip directly to their blueprint. Asked once (localStorage).
  // Fail OPEN: if storage is unavailable, SHOW the question (worst case a
  // returning visitor sees it again — never the other way around). Session-
  // scoped on purpose: "Was beschäftigt dich GERADE?" is a fresh question on
  // every visit and routes returning clients by their current concern.
  const entryKey = `vela_entryq_${shortHash(chartHash())}`;
  const [entryDone, setEntryDone] = useState<boolean>(() => {
    if (!viewer) return true;
    try { return sessionStorage.getItem(entryKey) === "1"; } catch { return false; }
  });
  const finishEntry = (themeKey?: string) => {
    try { sessionStorage.setItem(entryKey, "1"); } catch { /* ignore */ }
    setEntryDone(true);
    // Regel §7: das Rad muss im ersten Viewport stehen — nicht die
    // Scroll-Position des Frage-Screens erben
    window.scrollTo({ top: 0 });
    if (themeKey) openTheme(themeKey);
  };

  // land at the top when opening a theme / HD, or returning to the hub
  useEffect(() => { window.scrollTo({ top: 0 }); }, [activeTheme]);

  if (activeTheme === "__hd__" && birth) return <HDView birth={birth} />;
  if (activeTheme) return <ThemeReading themeKey={activeTheme} />;

  const first = String(PROFILE.name).split(" ")[0];

  if (viewer && !entryDone) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 lg:px-10">
        <div className="w-full max-w-[640px]">
          <div className="vela-wordmark mb-4 text-[12px]">Vela <span className="ml-2 font-mono text-[9px] normal-case tracking-normal text-white/25">Stand {__BUILD_ID__}</span></div>
          {/* KANONISCHE REGEL: das Chart ist IMMER sichtbar — auch hier */}
          <div className="pointer-events-none mx-auto mb-6 w-full max-w-[220px] drop-shadow-[0_0_28px_rgba(120,150,255,0.22)]">
            <ChartWheel />
          </div>
          <h1 className="text-center font-cinzel text-[30px] font-light leading-[1.12] text-white [text-shadow:0_0_30px_rgba(120,150,255,0.3)] lg:text-[40px]">
            Was beschäftigt dich gerade, {first}?
          </h1>
          <p className="mt-3 font-body text-[15px] leading-relaxed text-txt-2">
            Wähle, was dich bewegt — dein Geburtsbild wird genau durch diese Linse gelesen.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {THEMES.map((th, i) => (
              <Reveal key={th.key} i={i}>
                <button
                  onClick={() => finishEntry(th.key)}
                  className="vela-tile vela-tile-hover flex w-full items-center gap-3.5 p-4 text-left backdrop-blur-xl"
                >
                  <span
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-glyph text-[21px]"
                    style={{ color: th.accent, background: `radial-gradient(circle, ${th.accent}2b, transparent 72%)`, border: `1px solid ${th.accent}3a` }}
                  >
                    {th.glyph}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-cinzel text-[19px] font-light leading-tight text-white">{th.label}</span>
                    <span className="mt-0.5 block truncate font-body text-[12.5px] text-txt-3">{th.teaser}</span>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
          <button
            onClick={() => finishEntry()}
            className="mx-auto mt-8 block font-body text-[14px] text-[#97B5FF] transition hover:translate-x-0.5"
          >
            Überspringen — direkt zu meinem Blueprint →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slideUp px-6 pb-40 pt-[calc(env(safe-area-inset-top,0px)+2.5rem)] lg:px-10 lg:pt-12">
      <div className="mx-auto w-full max-w-[860px]">
        {/* Kopf (Konzept ChartHome): Eyebrow · Name · Geburtsdaten — Orb rechts */}
        <Reveal>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="vela-wordmark text-[11px]">Vela <span className="ml-2 font-mono text-[9px] normal-case tracking-normal text-white/25">Stand {__BUILD_ID__}</span></div>
              <div className="v-eyebrow mt-5">Geburts-Chart</div>
              <h1 className="mt-1.5 font-cinzel text-[27px] font-normal uppercase leading-tight tracking-[0.06em] text-white lg:text-[34px]">{first}</h1>
              <div className="mt-1.5 font-body text-[11.5px] text-white/50">{PROFILE.birth}</div>
            </div>
            <IridescentOrb size={44} className="mt-2" />
          </div>
        </Reveal>

        {/* Kurz gesagt — schließbar, solide Hero-Fläche */}
        {kurz && (
          <Reveal>
            <div className="relative mb-7 rounded-[16px] px-[15px] py-[13px]" style={{ background: "linear-gradient(180deg,#201D2C 0%,#1B1926 55%,#17141F 100%)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.09), inset 0 1px 0 rgba(255,255,255,.05)" }}>
              <button onClick={() => setKurz(false)} aria-label="Schließen" className="absolute right-2 top-2 p-1 text-white/40 transition hover:text-white/70">
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="v-eyebrow" style={{ color: "#97B5FF" }}>Kurz gesagt</div>
              <p className="mr-5 mt-1.5 font-body text-[13px] leading-[1.55] text-[rgba(238,245,248,0.72)]">{kurzText}</p>
            </div>
          </Reveal>
        )}

        {/* KANONISCHE REGEL (Laura): Das Chart ist IMMER sichtbar — das Rad
            ist das erste Inhaltselement und hier DIREKT interaktiv (Konzept:
            Punkte, Linien, Zeichen antippen → Sheet öffnet sich). */}
        <Reveal>
          <section className="relative mb-9 flex flex-col items-center gap-2.5">
            <div className="pointer-events-none absolute left-1/2 top-[168px] h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-plus-lighter" style={{ background: "radial-gradient(circle, rgba(120,150,255,0.24) 0%, rgba(120,157,255,0.10) 45%, transparent 68%)" }} />
            <div className="pointer-events-none absolute left-1/2 top-[168px] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "rgba(10,9,18,0.55)", boxShadow: "0 0 60px 20px rgba(10,9,18,0.55)" }} />
            <div className="relative w-full max-w-[336px]">
              <ChartWheel />
            </div>
            <span className="relative font-body text-[10.5px] uppercase tracking-[1.6px] text-white/[0.38]">Alles ist antippbar — Punkte, Linien, Zeichen</span>
            <button onClick={() => setHomeView("chart")} className="relative font-body text-[13.5px] text-[#97B5FF] transition hover:translate-x-0.5">Ganzes Rad im Detail →</button>
          </section>
        </Reveal>

        {/* Auf einen Blick — Kachel-Grid (Konzept ChartWeiter) */}
        <Reveal>
          <section className="mb-9">
            <div className="v-eyebrow mb-2.5">Auf einen Blick</div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Kachel glyph={sunP?.glyph ?? "☉"} label="Sonne" value={sunP ? signName(sunP.lon) : "—"} sub={sunP ? `${sunP.house ?? houseOf(sunP.lon)}. Haus` : ""} onClick={() => openInfo({ kind: "planet", key: "sun" })} />
              <Kachel glyph={moonP?.glyph ?? "☽"} label="Mond" value={moonP ? signName(moonP.lon) : "—"} sub={moonP ? `${moonP.house ?? houseOf(moonP.lon)}. Haus` : ""} onClick={() => openInfo({ kind: "planet", key: "moon" })} />
              <Kachel glyph="AC" label="Aszendent" value={acSign} sub="Auftritt" onClick={() => openInfo({ kind: "sign", key: signIdx(ASC) })} />
              <Kachel glyph="◈" label="Element" value={ELEMS[eMax]} sub={`${eCount[eMax]} Stände`} onClick={() => setHomeView("chart")} />
              <Kachel glyph="◆" label="Modus" value={MODES[mMax]} sub={MODE_SUB[MODES[mMax]]} onClick={() => setHomeView("chart")} />
              {t0 && <Kachel glyph={`${t0.tg} ${t0Glyph}`} label="Heute" value={t0Aspect} sub="Transit" lit onClick={() => setTab("transite")} />}
            </div>
          </section>
        </Reveal>

        {/* Lebensthemen — vertikales Karten-Raster (Bento-Rückbau: die
            4er-Bento-Section aus PR #97 war loum.ai-Content; die Moodboard-
            Referenzen stützen gleichmäßiges Karten-Scrolling). */}
        <div className="mb-4">
          <div className="vela-label mb-1.5 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Lebensthemen</div>
          <p className="max-w-[46ch] font-body text-[14.5px] leading-relaxed text-txt-3">
            {viewer ? "Wähle ein Lebensthema, das dich gerade bewegt — dein Geburtsbild, gelesen durch diese Linse." : "Wähle ein Lebensthema — dein Geburtsbild, gelesen durch diese Linse. Kein Fachchinesisch, nur was es für dich bedeutet."}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {THEMES.map((t, i) => (
            <Reveal key={t.key} i={i}>
              <button
                onClick={() => openTheme(t.key)}
                className="vela-tile vela-tile-hover group relative flex h-full w-full flex-col overflow-hidden p-6 text-left"
              >
                <span className="pointer-events-none absolute -right-4 -top-8 font-glyph text-[112px] leading-none opacity-[0.09]" style={{ color: t.accent }}>{t.glyph}</span>
                <div className="relative flex items-start justify-between">
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full font-glyph text-[24px]"
                    style={{ color: t.accent, background: `radial-gradient(circle, ${t.accent}2b, transparent 72%)`, border: `1px solid ${t.accent}3a` }}
                  >
                    {t.glyph}
                  </span>
                  <ChevronRight className="mt-2 h-5 w-5 text-txt-3 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="relative mt-4 font-cinzel text-[21px] uppercase leading-tight text-txt">{t.label}</div>
                <div className="relative mt-2 font-body text-[14px] leading-relaxed text-txt-3">{t.teaser}</div>
              </button>
            </Reveal>
          ))}
          {birth && (
            <Reveal i={THEMES.length} className="sm:col-span-2 lg:col-span-2">
              <button
                onClick={() => openTheme("__hd__")}
                className="vela-tile vela-tile-hover flex h-full w-full items-center justify-between gap-4 p-6 text-left"
              >
                <div className="flex items-center gap-3.5">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(120,150,255,0.4)] bg-[rgba(120,150,255,0.12)] text-lilac"><Hexagon className="h-5 w-5" strokeWidth={1.7} /></span>
                  <div>
                    <div className="font-cinzel text-[19px] uppercase text-txt">Human Design</div>
                    <div className="mt-0.5 font-body text-[13px] text-txt-3">Typ, Strategie, Autorität, Profil & Zentren.</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-txt-3" />
              </button>
            </Reveal>
          )}
        </div>

        {/* Dein Portrait — the deep, synthesized whole-chart reading, the head
            of the page. Leads with meaning; the themes below go deeper per lens. */}
        {portraitParas.length > 0 ? (
          <section className="mt-10">
            <div className="vela-label mb-4 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Dein Portrait</div>
            <div className="rounded-[24px] border border-white/8 bg-[rgba(18,18,29,0.5)] p-6 backdrop-blur-xl lg:p-8">
              {portraitParas.map((p, i) => (
                <Reveal key={i} i={i}>
                  <p className={`font-body leading-[1.75] text-txt-2 ${i === 0 ? "text-[18.5px] font-medium text-white" : "mt-5 text-[16.5px]"}`}>{p}</p>
                </Reveal>
              ))}
            </div>
          </section>
        ) : aiLoading ? (
          <section className="mt-10">
            <div className="vela-label mb-4 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Dein Portrait</div>
            <div className="rounded-[24px] border border-white/8 bg-[rgba(18,18,29,0.5)] p-6 backdrop-blur-xl lg:p-8">
              <GenerativeLoader
                messages={[
                  "Dein Bild setzt sich zusammen …",
                  "Vela liest dein ganzes Geburtsbild …",
                  "Deine Kräfte finden Worte …",
                ]}
                widths={[100, 92, 96, 84, 70]}
              />
            </div>
          </section>
        ) : null}

        {/* the full chart, one tap away (Human Design lives in the bento above) */}
        <Reveal i={THEMES.length + 1}>
          <button
            onClick={() => setHomeView("chart")}
            className="vela-tile vela-tile-hover mt-4 flex w-full items-center justify-between gap-4 p-5 text-left"
          >
            <div className="flex items-center gap-3.5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-lilac"><CircleDot className="h-5 w-5" strokeWidth={1.7} /></span>
              <div>
                <div className="font-cinzel text-[19px] uppercase text-txt">Ganzes Geburtsrad</div>
                <div className="mt-0.5 font-body text-[13px] text-txt-3">Alle Planeten, Häuser & Aspekte — zum Erkunden.</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-txt-3" />
          </button>
        </Reveal>
      </div>
    </div>
  );
}

/** Focused, theme-lensed reading — the 5-level dramaturgy (Gemini, cached) plus
 *  the foregrounded placements as "the forces in detail". */
function ThemeReading({ themeKey }: { themeKey: string }) {
  const closeTheme = useApp((s) => s.closeTheme);
  const openInfo = useApp((s) => s.openInfo);
  const chartVersion = useApp((s) => s.chartVersion);
  const setQ = useApp((s) => s.setQ);
  const ask = useApp((s) => s.ask);
  const t = themeByKey(themeKey);
  const [intro, setIntro] = useState<{ text: string; loading: boolean }>({ text: "", loading: true });
  const [secState, setSecState] = useState<Record<string, { text: string; loading: boolean }>>({});
  const [kompass, setKompass] = useState<{ text: string; loading: boolean }>({ text: "", loading: true });
  const [fragen, setFragen] = useState<string[]>([]);

  useEffect(() => {
    if (!t) return;
    let cancelled = false;
    setIntro({ text: "", loading: true });
    setKompass({ text: "", loading: true });
    setFragen([]);
    setSecState(Object.fromEntries(THEME_SECTIONS.map((d) => [d.key, { text: "", loading: true }])));
    const ctx = chartContext();
    const h = shortHash(chartHash());
    // One focused call per part, all in parallel, each retried through Gemini
    // overload (503 → empty) and cached individually server-side.
    const fire = (part: string, task: string, apply: (txt: string) => void, ctxOverride?: string) => {
      retry(
        () => supabase.functions.invoke("generate", {
          body: { chart_hash: chartHash(), cacheKey: `theme:${t.key}:v8:${part}:${h}`, context: ctxOverride ?? ctx, task, long: true, model: AI_MODEL_CORE },
        }),
        (r) => !!r.data?.text,
        { tries: 4, delayMs: 1800 },
      )
        .then(({ data }) => { if (!cancelled) apply(data?.text || ""); })
        .catch(() => { if (!cancelled) apply(""); });
    };
    fire("intro", introTask(t), (txt) => setIntro({ text: txt, loading: false }));
    // Der Kompass — its own distinct element (Laura: yes, but reworded and
    // implemented as its own thing, not buried in "Konkret").
    fire("kompass", `Schreibe für das Lebensthema „${t.label}" dieses Menschen GENAU 3 Zeilen — jede beginnt mit „– " (Gedankenstrich, Leerzeichen), keine Nummern, kein sonstiger Text davor oder danach.
Linse: ${t.lens}
Jede Zeile ist EIN konkretes Erkennungszeichen, woran diese Person im echten Leben MERKT, dass etwas in diesem Bereich wirklich zu ihr passt — körperlich spürbar, emotional oder im Alltag beobachtbar, abgeleitet aus DIESEM Chart (ohne die Stellung technisch zu nennen). Jede Zeile 1–2 kurze Sätze, Du-Form. Kein Satz, der auf jeden zutrifft.`,
      (txt) => setKompass({ text: txt, loading: false }));
    // Weiterfragen — personal follow-up questions the reader can tap to ask Vela.
    fire("fragen", `Formuliere GENAU 3 kurze Anschlussfragen zum Lebensthema „${t.label}", die DIESER Mensch nach seiner Deutung vermutlich stellen würde — jede Zeile im Format „1. …", aus seiner Ich-Perspektive („Warum …ich…?"), persönlich an seinem Chart orientiert, maximal 12 Wörter pro Frage. Nichts außer den drei Zeilen.`,
      (txt) => setFragen(
        txt.split(/\n+/).map((l) => l.replace(/^\d+[.)]\s*/, "").trim()).filter((l) => l.length > 4).slice(0, 3),
      ));
    for (const d of THEME_SECTIONS) {
      // "Gerade jetzt" gets the current-sky facts and a month-bucketed cache
      // key, so it refreshes as the sky moves on — the rest stays timeless.
      const isNow = d.key === "jetzt";
      const part = (isNow ? `jetzt:${new Date().toISOString().slice(0, 7)}` : d.key) + (d.v ?? "");
      const ctxOv = isNow ? `${ctx}\n\n${transitContext()}` : undefined;
      fire(part, d.task(t), (txt) => setSecState((s) => ({ ...s, [d.key]: { text: txt, loading: false } })), ctxOv);
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeKey, chartVersion]);
  const loading = intro.loading;

  if (!t) return null;

  const items = t.planets
    .map((key) => {
      const p = CHART.find((x) => x.key === key);
      if (!p) return null;
      const sheet = resolveSheet({ kind: "planet", key });
      const personal = sheet?.sections.find((s) => s.accent);
      const h = p.house ?? houseOf(p.lon);
      return { key, name: p.name, glyph: p.glyph, pos: `${signName(p.lon)} · ${h}. Haus (${HOUSE[h - 1]})`, body: personal?.body ?? "" };
    })
    .filter(Boolean) as { key: string; name: string; glyph: string; pos: string; body: string }[];

  const paras = intro.text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  // Accordion sections — shown as soon as the intro is there; each streams in
  // on its own (still-loading sections shimmer, failed ones disappear).
  const sections = THEME_SECTIONS.map((d) => ({ title: d.title, body: secState[d.key]?.text ?? "", loading: secState[d.key]?.loading ?? true }))
    .filter((s) => s.loading || s.body);

  return (
    <div className="animate-slideUp px-6 pb-40 pt-[calc(env(safe-area-inset-top,0px)+2rem)] lg:px-10 lg:pt-10">
      <div className="mx-auto w-full max-w-[720px]">
        <button onClick={closeTheme} className="mb-7 flex items-center gap-2 font-body text-[14px] text-txt-2 transition hover:text-txt">
          <ArrowLeft className="h-4 w-4" /> Themen
        </button>

        <header className="mb-8 flex items-center gap-4">
          <span
            className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-glyph text-[32px]"
            style={{ color: t.accent, background: `radial-gradient(circle, ${t.accent}2e, transparent 72%)`, boxShadow: `0 0 30px -6px ${t.accent}88`, border: `1px solid ${t.accent}3a` }}
          >
            {t.glyph}
          </span>
          <div>
            <h1 className="font-cinzel text-[34px] font-light leading-[1.05] text-white lg:text-[44px]">{t.label}</h1>
            <p className="mt-1.5 font-body text-[15px] text-txt-3">{t.teaser}</p>
          </div>
        </header>

        {/* the reading — 5-level dramaturgy, flowing */}
        {loading ? (
          <GenerativeLoader
            glyph={t.glyph}
            accent={t.accent}
            messages={[
              "Dein Bild setzt sich zusammen …",
              `Vela liest dich durch die Linse „${t.label}" …`,
              "Deine Kräfte finden Worte …",
            ]}
          />
        ) : paras.length || sections.length ? (
          <div className="mb-4">
            {paras.map((p, i) => (
              <Reveal key={i} i={i}>
                <p className={`font-body text-[17.5px] leading-[1.75] text-txt-2 ${i === 0 ? "text-[19px] font-medium text-white" : "mt-5"}`}>{p}</p>
              </Reveal>
            ))}
            {/* Der Kompass — distinct, quiet highlight: how YOU recognise what fits */}
            {(kompass.text || kompass.loading) && (
              <Reveal>
                <div className="mt-8 rounded-[22px] border p-5 backdrop-blur-xl lg:p-6" style={{ borderColor: `${t.accent}38`, background: `linear-gradient(135deg, ${t.accent}0e, transparent 60%)` }}>
                  <div className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.accent }}>Woran du erkennst, was zu dir passt</div>
                  {kompass.text ? (
                    <div className="space-y-2.5">
                      {kompass.text.replace(/\*\*/g, "").split(/\n+/).map((l) => l.replace(/^[–-]\s*/, "").trim()).filter(Boolean).slice(0, 4).map((l, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }} />
                          <p className="font-body text-[15.5px] leading-relaxed text-txt-2">{l}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5 py-1">
                      {[96, 88, 80].map((w, i) => (
                        <div key={i} className="h-3 animate-pulse rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            )}
            {sections.length > 0 && (
              <div className="mt-8 space-y-3">
                {sections.map((s, i) => (
                  <Reveal key={s.title} i={i}>
                    <ThemeSection title={s.title} body={s.body} loading={s.loading} accent={t.accent} defaultOpen={i === 0} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* the forces in detail */}
        {items.length > 0 && (
          <div className="mt-10">
            <div className="vela-label mb-4 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Die Kräfte in deinem Bild</div>
            <div className="space-y-4">
              {items.map((it, i) => (
                <Reveal key={it.key} i={i}>
                  <ForceCard it={it} accent={t.accent} onOpen={() => openInfo({ kind: "planet", key: it.key })} />
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {/* Weiterfragen — tap a personal follow-up question, Vela answers in the composer */}
        <div className="mt-8 rounded-[20px] border border-white/8 bg-white/[0.03] p-5">
          <p className="font-body text-[14px] leading-relaxed text-txt-3">
            {fragen.length ? "Frag weiter — das liegt dir vielleicht gerade auf der Zunge:" : "Frag Vela unten alles zu diesem Thema — sie liest es aus deinem Chart."}
          </p>
          {fragen.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {fragen.map((f) => (
                <button
                  key={f}
                  onClick={() => { setQ(f); void ask(f); }}
                  className="rounded-pill border border-white/[0.12] bg-white/[0.05] px-3.5 py-2 text-left font-body text-[13px] leading-snug text-ink-soft/90 backdrop-blur-md transition hover:border-[rgba(120,150,255,0.45)] active:scale-95"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
        <MotionSpacer />
      </div>
    </div>
  );
}

function MotionSpacer() {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-2" />;
}

/** Überblick-Kachel (Konzept ChartWeiter): Glass-Tile mit Glyph, Label, Wert. */
function Kachel({ glyph, label, value, sub, lit, onClick }: { glyph: string; label: string; value: string; sub?: string; lit?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      data-interactive="true"
      className="glass-surface flex flex-col gap-1.5 rounded-[14px] px-3 pb-[11px] pt-3 text-left"
      style={lit ? { background: "linear-gradient(180deg,#1B1926 0%,#151420 100%)", boxShadow: "inset 0 0 0 1px rgba(120,150,255,.3)" } : undefined}
    >
      <span className={`font-glyph text-[15px] leading-none ${lit ? "text-[#97B5FF]" : "text-[rgba(238,245,248,0.6)]"}`}>{glyph}</span>
      <span className="font-body text-[9px] uppercase tracking-[1.6px] text-white/40">{label}</span>
      <span className="-mt-0.5 font-body text-[13.5px] font-medium text-txt">{value}</span>
      {sub && <span className="-mt-1 font-body text-[10.5px] text-white/[0.38]">{sub}</span>}
    </button>
  );
}

/** One "force" card on a theme page. The body is a REAL reading — the stored
 *  cockpit interpretation if there is one, else generated live with the full
 *  interpretive craft (same viewKey as the tap-sheet, so both share a cache).
 *  The old template line only shows as a last-resort fallback. */
function ForceCard({ it, accent, onOpen }: { it: { key: string; name: string; glyph: string; pos: string; body: string }; accent: string; onOpen: () => void }) {
  const st = subjectTask({ kind: "planet", key: it.key });
  const stored = storedReading({ kind: "planet", key: it.key });
  // craft reading FIRST (deep, grounded); thin stored text only as fallback
  const { text, loading } = useReading(st?.viewKey ?? "", st?.task ?? "", !!st && !IS_DEMO);
  const body = text || (loading ? "" : stored || it.body);
  return (
    <button onClick={onOpen} className="vela-tile vela-tile-hover relative w-full overflow-hidden p-6 text-left backdrop-blur-xl">
      <div className="relative flex items-center gap-3">
        <span className="font-glyph text-[22px]" style={{ color: accent }}>{it.glyph}</span>
        <div className="min-w-0">
          <div className="font-cinzel text-[21px] font-light leading-tight text-white">{it.name}</div>
          <div className="mt-0.5 font-body text-[12.5px] text-txt-3">{it.pos}</div>
        </div>
      </div>
      {body ? (
        <p className="relative mt-3.5 font-body text-[16px] leading-relaxed text-txt-2">{body}</p>
      ) : loading ? (
        <div className="relative mt-4 space-y-2.5">
          {[100, 90, 74].map((w, i) => (
            <div key={i} className="h-3 animate-pulse rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : null}
      <span className="relative mt-3 inline-block font-body text-[13px] text-[#97B5FF]">Mehr dazu →</span>
    </button>
  );
}

/** One accordion section of a theme reading ("## Titel" blocks) — context in
 *  layers instead of a wall of text. Numbered lines render as list items. */
function ThemeSection({ title, body, loading, accent, defaultOpen }: { title: string; body: string; loading?: boolean; accent: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  // strip stray markdown emphasis the model might emit despite instructions
  const paras = body.replace(/\*\*/g, "").split(/\n+/).map((s) => s.trim()).filter(Boolean);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      className="vela-tile vela-tile-hover relative w-full overflow-hidden p-5 text-left backdrop-blur-xl lg:p-6"
    >
      <div className="relative flex items-center justify-between gap-3">
        <h3 className="font-cinzel text-[20px] font-light leading-tight text-white lg:text-[22px]">{title}</h3>
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300"
          style={{ color: accent, background: `${accent}14`, border: `1px solid ${accent}33`, transform: open ? "rotate(90deg)" : "none" }}
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3.5 space-y-3.5">
              {loading && !paras.length && (
                <div className="space-y-2.5 py-1">
                  {[100, 92, 84].map((w, i) => (
                    <div key={i} className="h-3 animate-pulse rounded-full bg-white/[0.06]" style={{ width: `${w}%` }} />
                  ))}
                </div>
              )}
              {paras.map((p, i) => {
                const num = p.match(/^(\d+)[.)]\s+(.*)$/s);
                if (num) {
                  return (
                    <div key={i} className="flex gap-3">
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
                        style={{ color: accent, background: `${accent}16`, border: `1px solid ${accent}33` }}
                      >
                        {num[1]}
                      </span>
                      <p className="font-body text-[16px] leading-[1.7] text-txt-2">{num[2]}</p>
                    </div>
                  );
                }
                // "Leitworte — Absatz…" rhythm: style the short lead-in in the
                // theme accent so long sections scan instead of souping.
                const lead = p.match(/^([^—.!?\n]{2,44}?)\s+—\s+(.*)$/s);
                return lead ? (
                  <p key={i} className="font-body text-[16px] leading-[1.7] text-txt-2">
                    <span className="font-display text-[15px] font-semibold" style={{ color: accent }}>{lead[1]}</span>
                    <span className="text-txt-3"> — </span>
                    {lead[2]}
                  </p>
                ) : (
                  <p key={i} className="font-body text-[16px] leading-[1.7] text-txt-2">{p}</p>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

const ALL_CENTERS = ["Kopf", "Ajna", "Kehle", "G", "Ego", "Sakral", "Solarplexus", "Milz", "Wurzel"];

/** Human Design bodygraph summary — computed offline from the birth data. */
function HDView({ birth }: { birth: BirthInput }) {
  const closeTheme = useApp((s) => s.closeTheme);
  const hd = useMemo(() => computeHumanDesign(birth), [birth]);
  const first = String(PROFILE.name).split(" ")[0];
  const [open, setOpen] = useState<number | null>(null);

  const TYPE_DESC: Record<string, string> = {
    "Projektor": "hier, um zu führen und andere zu lenken — wirksam, sobald du erkannt und eingeladen wirst. Nicht fürs Dauer-Anpacken gebaut.",
    "Generator": "die schöpferische Lebenskraft. Du kommst in Fahrt, indem du auf das reagierst, was dir begegnet — nicht durchs Initiieren.",
    "Manifestierender Generator": "reagieren und schnell umsetzen, oft mehrgleisig. Informiere andere, bevor du losziehst.",
    "Manifestor": "hier, um zu initiieren und anzustoßen. Informiere andere vor dem Handeln, dann bist du frei.",
    "Reflektor": "ein Spiegel deiner Umgebung. Triff große Entscheidungen erst nach einem vollen Mondzyklus.",
  };
  const authDesc = (a: string) => {
    if (a.includes("Emotional")) return "keine Entscheidung im Affekt — warte deine emotionale Welle ab, Klarheit kommt mit der Zeit.";
    if (a.includes("Sakral")) return "das Bauch-Ja/Nein im Moment — ein spontanes Ja oder Nein aus der Körpermitte. Reagiere darauf.";
    if (a.includes("Milz")) return "leises, spontanes Bauchgefühl im Jetzt — es spricht nur einmal. Vertraue dem ersten Impuls.";
    if (a.includes("Ego")) return "entscheide aus Willenskraft — was willst du wirklich, wofür brennst du?";
    if (a.includes("Selbst")) return "hör dich selbst reden — deine Wahrheit zeigt sich, wenn du sie aussprichst.";
    if (a.includes("Lunar")) return "warte einen vollen Mondzyklus (~28 Tage), bevor du Großes entscheidest.";
    return "du brauchst die richtige Umgebung und das Aussprechen mit Vertrauten, um klar zu werden.";
  };
  const facts = [
    { k: "Typ", v: hd.type, info: `Dein Grundtyp — er bestimmt deine Strategie, wie du ohne Widerstand in Bewegung kommst. ${TYPE_DESC[hd.type] ?? ""}` },
    { k: "Autorität", v: hd.authority, info: `Deine innere Instanz für richtige Ja/Nein-Entscheidungen — nicht der Kopf, sondern dein verlässlichstes Signal: ${authDesc(hd.authority)}` },
    { k: "Profil", v: `${hd.profile} · ${hd.profileAngle}`, info: "Zwei Ziffern (1–6) = deine Lebensrolle. Erste Zahl = bewusst (wie du dich erlebst), zweite = unbewusst (wie andere dich erleben). Sie beschreiben, wie du lernst und wirkst." },
    { k: "Strategie", v: hd.strategy, info: "So triffst du richtige Entscheidungen und vermeidest Widerstand — der praktische Kern deines Designs im Alltag." },
    { k: "Signatur", v: hd.signature, info: "Das Gefühl, wenn du deiner Natur folgst — dein Kompass, dass es gerade richtig läuft." },
    { k: "Nicht-Selbst-Thema", v: hd.notSelf, info: "Das Warnsignal, wenn du gegen deine Natur lebst. Taucht es auf, korrigiere über Strategie und Autorität." },
    { k: "Definition", v: hd.definition, info: "Wie deine definierten Zentren verbunden sind. Einfach = ein durchgehender Fluss; Split = zwei Bereiche, die sich (oft über andere Menschen) verbinden wollen." },
    { k: "Inkarnationskreuz", v: `${hd.profileAngle} (${hd.crossGates})`, info: "Dein übergeordnetes Lebensthema, aus den vier Sonne/Erde-Toren von Personality & Design. Rechtswinkel = persönlicher Weg; Linkswinkel = eher über Beziehungen/Kollektiv." },
  ];

  return (
    <div className="animate-slideUp px-6 pb-40 pt-[calc(env(safe-area-inset-top,0px)+2rem)] lg:px-10 lg:pt-10">
      <div className="mx-auto w-full max-w-[720px]">
        <button onClick={closeTheme} className="mb-7 flex items-center gap-2 font-body text-[14px] text-txt-2 transition hover:text-txt">
          <ArrowLeft className="h-4 w-4" /> Themen
        </button>

        <header className="mb-9 flex items-center gap-4">
          <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[rgba(120,150,255,0.4)] bg-[rgba(120,150,255,0.12)] text-[#97B5FF]" style={{ boxShadow: "0 0 30px -6px rgba(120,150,255,0.8)" }}>
            <Hexagon className="h-7 w-7" strokeWidth={1.6} />
          </span>
          <div>
            <h1 className="font-cinzel text-[34px] font-light leading-[1.05] text-white lg:text-[44px]">Human Design</h1>
            <p className="mt-1.5 font-body text-[15px] text-txt-3">{first} · {hd.type}</p>
          </div>
        </header>

        <div className="grid items-start gap-3.5 sm:grid-cols-2">
          {facts.map((f, i) => (
            <Reveal key={f.k} i={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="vela-tile vela-tile-hover relative w-full overflow-hidden p-5 text-left backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="vela-label">{f.k}</div>
                  <Info className={`h-4 w-4 shrink-0 transition-colors ${open === i ? "text-[#97B5FF]" : "text-txt-3"}`} />
                </div>
                <div className="mt-2 font-cinzel text-[20px] font-light leading-tight text-white">{f.v}</div>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 border-t border-line-soft pt-3 font-body text-[13.5px] leading-relaxed text-txt-2">{f.info}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {open !== i && <span className="mt-2 inline-block font-body text-[11.5px] text-[#97B5FF]/70">Was heißt das? →</span>}
              </button>
            </Reveal>
          ))}
        </div>

        <div className="mt-8">
          <div className="vela-label mb-3">Zentren · {hd.definedCenters.length}/9 definiert</div>
          <div className="flex flex-wrap gap-2">
            {ALL_CENTERS.map((c) => {
              const on = hd.definedCenters.includes(c);
              return (
                <span key={c} className={`rounded-pill px-3.5 py-1.5 font-body text-[13px] ${on ? "border border-[rgba(120,150,255,0.5)] bg-[rgba(120,150,255,0.14)] text-[#bdeefb]" : "border border-white/10 text-txt-3"}`}>
                  {c}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <div className="vela-label mb-3">Kanäle</div>
          <div className="flex flex-wrap gap-2">
            {hd.channels.length ? hd.channels.map((c) => (
              <span key={c} className="rounded-pill border border-white/12 bg-white/[0.05] px-3.5 py-1.5 font-mono text-[13px] text-txt-2">{c}</span>
            )) : <span className="font-body text-[13px] text-txt-3">—</span>}
          </div>
        </div>

        <p className="mt-8 rounded-[20px] border border-white/8 bg-white/[0.03] p-5 font-body text-[13.5px] leading-relaxed text-txt-3">
          Berechnet aus dem Geburtsbild — Personality (Geburt) + Design (88° Sonnenbogen vorher), gemappt aufs 64-Tore-Rad. Verifiziert gegen das offizielle Chart. Frag Vela unten alles zu deinem Design.
        </p>
      </div>
    </div>
  );
}
