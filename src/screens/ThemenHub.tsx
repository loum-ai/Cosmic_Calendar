import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, CircleDot, Hexagon } from "lucide-react";
import { THEMES, themeByKey } from "@/lib/themes";
import { CHART, PROFILE, signName, houseOf, HOUSE, IS_DEMO } from "@/lib/data";
import { resolveSheet } from "@/lib/sheets";
import { computeHumanDesign } from "@/lib/humandesign";
import type { BirthInput } from "@/lib/compute";
import { Reveal } from "@/components/Reveal";
import { useApp, DEMO_BIRTH } from "@/store/useApp";

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
  const birth: BirthInput | null = savedBirth ?? (IS_DEMO ? DEMO_BIRTH : null);

  if (activeTheme === "__hd__" && birth) return <HDView birth={birth} />;
  if (activeTheme) return <ThemeReading themeKey={activeTheme} />;

  const first = String(PROFILE.name).split(" ")[0];

  return (
    <div className="animate-slideUp px-6 pb-40 pt-[calc(env(safe-area-inset-top,0px)+2.5rem)] lg:px-10 lg:pt-12">
      <div className="mx-auto w-full max-w-[860px]">
        <header className="mb-10">
          <div className="vela-label mb-3">{viewer ? "Deine persönliche Astro-Website" : "Dein persönlicher Spiegel"}</div>
          <h1 className="font-cinzel text-[40px] font-light leading-[1.05] tracking-[0.01em] text-white [text-shadow:0_0_30px_rgba(79,214,239,0.3)] lg:text-[58px]">
            {viewer ? `Willkommen, ${first}` : first}
          </h1>
          <p className="mt-4 max-w-[44ch] font-body text-[16px] leading-relaxed text-txt-2">
            Wähle ein Lebensthema — dein Geburtsbild, gelesen durch diese Linse. Kein Fachchinesisch, nur was es für dich bedeutet.
          </p>
        </header>

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

/** Focused, theme-lensed reading — the theme's foregrounded placements only. */
function ThemeReading({ themeKey }: { themeKey: string }) {
  const closeTheme = useApp((s) => s.closeTheme);
  const openInfo = useApp((s) => s.openInfo);
  const t = themeByKey(themeKey);
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

  return (
    <div className="animate-slideUp px-6 pb-40 pt-[calc(env(safe-area-inset-top,0px)+2rem)] lg:px-10 lg:pt-10">
      <div className="mx-auto w-full max-w-[720px]">
        <button onClick={closeTheme} className="mb-7 flex items-center gap-2 font-body text-[14px] text-txt-2 transition hover:text-txt">
          <ArrowLeft className="h-4 w-4" /> Themen
        </button>

        <header className="mb-9 flex items-center gap-4">
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
  const facts = [
    { k: "Typ", v: hd.type },
    { k: "Autorität", v: hd.authority },
    { k: "Profil", v: `${hd.profile} · ${hd.profileAngle}` },
    { k: "Strategie", v: hd.strategy },
    { k: "Signatur", v: hd.signature },
    { k: "Nicht-Selbst-Thema", v: hd.notSelf },
    { k: "Definition", v: hd.definition },
    { k: "Inkarnationskreuz", v: `${hd.profileAngle} (${hd.crossGates})` },
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

        <div className="grid gap-3.5 sm:grid-cols-2">
          {facts.map((f, i) => (
            <Reveal key={f.k} i={i}>
              <div className="vela-tile p-5 backdrop-blur-xl">
                <div className="vela-label">{f.k}</div>
                <div className="mt-2 font-cinzel text-[20px] font-light leading-tight text-white">{f.v}</div>
              </div>
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
