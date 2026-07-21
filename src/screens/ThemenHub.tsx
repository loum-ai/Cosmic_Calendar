import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GenerativeLoader } from "@/components/GenerativeLoader";
import { ArrowLeft, ChevronRight, CircleDot, Hexagon, Info, Sparkles } from "lucide-react";
import { THEMES, themeByKey, type LifeTheme } from "@/lib/themes";
import { CHART, PROFILE, signName, houseOf, HOUSE, IS_DEMO } from "@/lib/data";
import { resolveSheet } from "@/lib/sheets";
import { computeHumanDesign } from "@/lib/humandesign";
import { chartContext, chartHash, shortHash } from "@/lib/factsContext";
import { aiPortrait } from "@/lib/interpret";
import { supabase } from "@/lib/supabase";
import type { BirthInput } from "@/lib/compute";
import { Reveal } from "@/components/Reveal";
import { useApp, DEMO_BIRTH } from "@/store/useApp";

/** Task for a life-theme reading — the LENS + what to foreground. The full
 *  5-level dramaturgy and the anti-generic rules live in the generate function's
 *  SYSTEM_LONG (long: true). */
function fiveLevelTask(t: LifeTheme): string {
  return `Deute das Lebensthema „${t.label}" (${t.teaser}) für DIESEN Menschen — tief, persönlich, konkret und vor allem NACHVOLLZIEHBAR, wie in einer echten Beratung.
Lies das Chart durch genau diese Linse: ${t.lens}
Nutze das ganze Bild aus den FAKTEN, im Dienst dieses Themas. Beantworte dabei ausdrücklich die Fragen, die dieser Mensch WIRKLICH hat — in verwobener Sprache, ohne Zwischenüberschriften, ohne Aufzählung:
- WARUM / ZUSAMMENHANG: Mach nachvollziehbar, warum genau diese Stellungen für dieses Thema stehen — z. B. warum ein bestimmtes Haus oder ein Planet hier zählt. Setze nichts voraus, erkläre die Verbindung in einem Satz, statt sie nur zu behaupten (der Mensch soll verstehen, WIESO).
- SPANNUNG: Benenne die zentrale Spannung PRÄZISE am Chart (der exakte Aspekt, z. B. ein bestimmtes Quadrat), nicht vage.
- ENTWICKLUNG: Sag klar, WIE sich dieser Mensch in diesem Bereich entwickelt — was reift früh, was erst spät, was ist der nächste Schritt. Die Mondknoten als Richtung.
- KONKRET & GREIFBAR: Werde anschaulich — wie zeigt sich das im echten Leben? Beim Thema Berufung z. B. welche ART von Tätigkeit, Rolle und Umfeld zu genau diesem Menschen passt (echte, konkrete Beispiele nennen), bei anderen Themen entsprechend konkret. Keine Abstraktion ohne Beispiel.
Kein Satz darf in jedes Horoskop passen. Warm, klar, ehrlich. Absätze durch Leerzeilen trennen.`;
}

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
  const portrait = aiPortrait();
  const portraitParas = portrait ? portrait.split(/\n\n+/).map((s) => s.trim()).filter(Boolean) : [];

  // land at the top when opening a theme / HD, or returning to the hub
  useEffect(() => { window.scrollTo({ top: 0 }); }, [activeTheme]);

  if (activeTheme === "__hd__" && birth) return <HDView birth={birth} />;
  if (activeTheme) return <ThemeReading themeKey={activeTheme} />;

  const first = String(PROFILE.name).split(" ")[0];

  return (
    <div className="animate-slideUp px-6 pb-40 pt-[calc(env(safe-area-inset-top,0px)+2.5rem)] lg:px-10 lg:pt-12">
      <div className="mx-auto w-full max-w-[860px]">
        <header className="mb-10">
          <div className="vela-wordmark mb-3 text-[12px]">Vela</div>
          <h1 className="font-cinzel text-[40px] font-light leading-[1.05] tracking-[0.01em] text-white [text-shadow:0_0_30px_rgba(79,214,239,0.3)] lg:text-[58px]">
            {viewer ? `Willkommen, ${first}` : first}
          </h1>
          <p className="mt-4 max-w-[46ch] font-body text-[16px] leading-relaxed text-txt-2">
            {viewer ? (
              <>Dein persönlicher astrologischer Blueprint. <span className="text-txt-3">Wähle ein Lebensthema, das dich gerade bewegt.</span></>
            ) : (
              "Wähle ein Lebensthema — dein Geburtsbild, gelesen durch diese Linse. Kein Fachchinesisch, nur was es für dich bedeutet."
            )}
          </p>
        </header>

        {/* Dein Portrait — the deep, synthesized whole-chart reading, the head
            of the page. Leads with meaning; the themes below go deeper per lens. */}
        {portraitParas.length > 0 ? (
          <section className="mb-10">
            <div className="vela-label mb-4 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Dein Portrait</div>
            <div className="rounded-[24px] border border-white/8 bg-[rgba(13,25,33,0.5)] p-6 backdrop-blur-xl lg:p-8">
              {portraitParas.map((p, i) => (
                <Reveal key={i} i={i}>
                  <p className={`font-body leading-[1.75] text-txt-2 ${i === 0 ? "text-[18.5px] font-medium text-white" : "mt-5 text-[16.5px]"}`}>{p}</p>
                </Reveal>
              ))}
            </div>
          </section>
        ) : aiLoading ? (
          <section className="mb-10">
            <div className="vela-label mb-4 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Dein Portrait</div>
            <div className="rounded-[24px] border border-white/8 bg-[rgba(13,25,33,0.5)] p-6 backdrop-blur-xl lg:p-8">
              <GenerativeLoader
                messages={[
                  "Die Sterne ordnen sich zu deinem Bild …",
                  "Vela liest dein ganzes Geburtsbild …",
                  "Deine Kräfte finden Worte …",
                ]}
                widths={[100, 92, 96, 84, 70]}
              />
            </div>
          </section>
        ) : null}

        {portraitParas.length > 0 && (
          <div className="vela-label mb-4 flex items-center gap-1.5"><CircleDot className="h-3.5 w-3.5" /> Lebensthemen</div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {THEMES.map((t, i) => (
            <Reveal key={t.key} i={i}>
              <button
                onClick={() => openTheme(t.key)}
                className="vela-tile vela-tile-hover group relative w-full overflow-hidden p-6 text-left backdrop-blur-xl"
              >
                <span className="pointer-events-none absolute -right-4 -top-8 font-glyph text-[112px] leading-none opacity-[0.09]" style={{ color: t.accent }}>{t.glyph}</span>
                <div className="relative flex items-start justify-between">
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full font-glyph text-[24px]"
                    style={{ color: t.accent, background: `radial-gradient(circle, ${t.accent}2b, transparent 72%)`, boxShadow: `0 0 24px -6px ${t.accent}77`, border: `1px solid ${t.accent}3a` }}
                  >
                    {t.glyph}
                  </span>
                  <ChevronRight className="mt-2 h-5 w-5 text-txt-3 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="relative mt-4 font-cinzel text-[25px] font-light leading-tight text-white">{t.label}</div>
                <div className="relative mt-2 font-body text-[14px] leading-relaxed text-txt-3">{t.teaser}</div>
              </button>
            </Reveal>
          ))}
        </div>

        {/* Human Design — a second lens on the same birth data */}
        {birth && (
          <Reveal i={THEMES.length}>
            <button
              onClick={() => openTheme("__hd__")}
              className="mt-4 flex w-full items-center justify-between gap-4 rounded-[22px] border border-[rgba(79,214,239,0.3)] bg-[rgba(15,27,35,0.5)] p-5 text-left backdrop-blur-xl transition hover:border-[rgba(79,214,239,0.6)]"
            >
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(79,214,239,0.4)] bg-[rgba(79,214,239,0.12)] text-[#8fe4f5]" style={{ boxShadow: "0 0 20px -6px rgba(79,214,239,0.7)" }}><Hexagon className="h-5 w-5" strokeWidth={1.7} /></span>
                <div>
                  <div className="font-cinzel text-[20px] font-light text-white">Human Design</div>
                  <div className="mt-0.5 font-body text-[13px] text-txt-3">Typ, Strategie, Autorität, Profil & Zentren.</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-txt-3" />
            </button>
          </Reveal>
        )}

        {/* the full chart, one tap away */}
        <Reveal i={THEMES.length + 1}>
          <button
            onClick={() => setHomeView("chart")}
            className="mt-4 flex w-full items-center justify-between gap-4 rounded-[22px] border border-white/10 bg-[rgba(15,27,35,0.5)] p-5 text-left backdrop-blur-xl transition hover:border-[rgba(79,214,239,0.4)]"
          >
            <div className="flex items-center gap-3.5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-[#8fe4f5]"><CircleDot className="h-5 w-5" strokeWidth={1.7} /></span>
              <div>
                <div className="font-cinzel text-[20px] font-light text-white">Ganzes Geburtsrad</div>
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
  const t = themeByKey(themeKey);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!t) return;
    let cancelled = false;
    setText(""); setLoading(true);
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("generate", {
          body: {
            chart_hash: chartHash(),
            cacheKey: `theme:${t.key}:v2:${shortHash(chartHash())}`,
            context: chartContext(),
            task: fiveLevelTask(t),
            long: true,
          },
        });
        if (!cancelled) setText(data?.text || "");
      } catch {
        /* leave the detail cards as the reading */
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeKey, chartVersion]);

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

  const paras = text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);

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
              "Die Sterne ordnen sich zu deinem Bild …",
              `Vela liest dich durch die Linse „${t.label}" …`,
              "Deine Kräfte finden Worte …",
            ]}
          />
        ) : paras.length ? (
          <div className="mb-4">
            {paras.map((p, i) => (
              <Reveal key={i} i={i}>
                <p className={`font-body text-[17.5px] leading-[1.75] text-txt-2 ${i === 0 ? "text-[19px] font-medium text-white" : "mt-5"}`}>{p}</p>
              </Reveal>
            ))}
          </div>
        ) : null}

        {/* the forces in detail */}
        {items.length > 0 && (
          <div className="mt-10">
            <div className="vela-label mb-4 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Die Kräfte in deinem Bild</div>
            <div className="space-y-4">
              {items.map((it, i) => (
                <Reveal key={it.key} i={i}>
                  <button
                    onClick={() => openInfo({ kind: "planet", key: it.key })}
                    className="vela-tile vela-tile-hover relative w-full overflow-hidden p-6 text-left backdrop-blur-xl"
                  >
                    <div className="relative flex items-center gap-3">
                      <span className="font-glyph text-[22px]" style={{ color: t.accent }}>{it.glyph}</span>
                      <div className="min-w-0">
                        <div className="font-cinzel text-[21px] font-light leading-tight text-white">{it.name}</div>
                        <div className="mt-0.5 font-body text-[12.5px] text-txt-3">{it.pos}</div>
                      </div>
                    </div>
                    {it.body && <p className="relative mt-3.5 font-body text-[16px] leading-relaxed text-txt-2">{it.body}</p>}
                    <span className="relative mt-3 inline-block font-body text-[13px] text-[#8fe4f5]">Mehr dazu →</span>
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 rounded-[20px] border border-white/8 bg-white/[0.03] p-5 font-body text-[14px] leading-relaxed text-txt-3">
          Frag Vela unten alles zu diesem Thema — sie liest es aus deinem Chart.
        </p>
        <MotionSpacer />
      </div>
    </div>
  );
}

function MotionSpacer() {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-2" />;
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
          <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[rgba(79,214,239,0.4)] bg-[rgba(79,214,239,0.12)] text-[#8fe4f5]" style={{ boxShadow: "0 0 30px -6px rgba(79,214,239,0.8)" }}>
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
                  <Info className={`h-4 w-4 shrink-0 transition-colors ${open === i ? "text-[#8fe4f5]" : "text-txt-3"}`} />
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
                {open !== i && <span className="mt-2 inline-block font-body text-[11.5px] text-[#8fe4f5]/70">Was heißt das? →</span>}
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
                <span key={c} className={`rounded-pill px-3.5 py-1.5 font-body text-[13px] ${on ? "border border-[rgba(79,214,239,0.5)] bg-[rgba(79,214,239,0.14)] text-[#bdeefb]" : "border border-white/10 text-txt-3"}`}>
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
