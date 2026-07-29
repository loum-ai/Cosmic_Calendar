import { useEffect, useState, type ReactNode } from "react";
import { X, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { useApp } from "@/store/useApp";
import { LAYER } from "@/lib/layers";
import { firstSentence, resolveSheet, type SheetContent, type SheetDescriptor, type SheetRelation } from "@/lib/sheets";
import { Sheet, SheetContent as SheetShell } from "@/components/ui/sheet";
import { GlyphBadge } from "@/components/GlyphBadge";
import { subjectTask, useReading, storedReading } from "@/lib/genReadings";
import { IS_DEMO } from "@/lib/data";
import { PLANET_PHOTO, PLANET_GLOW, PLANET_SCALE } from "@/lib/planetPhotos";
import { cardSurface } from "@/components/VelaCard";

function useIsDesktop() {
  const [d, setD] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width:1024px)");
    const u = () => setD(m.matches);
    u();
    m.addEventListener("change", u);
    return () => m.removeEventListener("change", u);
  }, []);
  return d;
}

/**
 * Regel 5 — Textwände auflösen. Deutungen kommen als ein einziger Block; hier
 * werden sie rein darstellend in Absätze gebrochen: erst an echten Umbrüchen,
 * sonst an Satzgrenzen zu ~320-Zeichen-Blöcken. Der Text bleibt unverändert.
 */
function paragraphs(text: string): string[] {
  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  const t = lines[0] ?? "";
  if (t.length <= 400) return t ? [t] : [];
  const sentences = t.match(/[^.!?…]+[.!?…]*\s*/g) ?? [t];
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    buf += s;
    if (buf.length >= 320) {
      out.push(buf.trim());
      buf = "";
    }
  }
  const rest = buf.trim();
  if (rest) {
    if (out.length && rest.length < 90) out[out.length - 1] += " " + rest;
    else out.push(rest);
  }
  return out;
}

/**
 * Fließtext im Sheet: erste Zeile als Lede (etwas größer, heller), der Rest
 * ruhiger. `tone="loud"` ist die persönliche Deutung, `"quiet"` das Lexikon.
 */
function Prose({ text, tone = "quiet" }: { text: string; tone?: "quiet" | "loud" }) {
  const paras = paragraphs(text);
  if (!paras.length) return null;
  return (
    <div className={tone === "loud" ? "space-y-3" : "space-y-2.5"}>
      {paras.map((p, i) => (
        <p
          key={i}
          className={
            tone === "loud"
              ? i === 0
                ? "font-body text-[15px] font-medium leading-[1.58] text-txt"
                : "font-body text-[15px] leading-[1.62] text-txt-2"
              : i === 0
                ? "font-body text-[15px] leading-[1.62] text-txt-2"
                : "font-body text-[15px] leading-[1.62] text-txt-3"
          }
        >
          {p}
        </p>
      ))}
    </div>
  );
}

/**
 * Die „Vela deutet"-Fläche: SOLIDE Ink-Karte (Regel 1) — kein Wash, kein
 * äußerer Schatten. Die Zugehörigkeit zur KI zeigt allein der mystic-Glow von
 * innen plus die mystic-Hairline.
 */
function DeutungBox({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="relative overflow-hidden p-[18px]" style={{ ...cardSurface("#20F0D0", "lead", 0.15), boxShadow: "inset 0 0 0 1px rgba(32,240,208,0.22)" }}>
      <div className="relative">
        <div className="mb-2.5 flex items-center gap-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-mint">
          {label}
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Eine Zeile der „Verbindungen"-Liste.
 *
 * WARUM EIGENE KOMPONENTE: Der Cockpit-Lauf deutet nur die 14 engsten Aspekte.
 * Gemessen an den echten Kundendaten fehlten dadurch 13 von 27 (ein Kunde),
 * 6 von 20, 5 von 19 — für diese Zeilen stand die Schablone. Fehlt die
 * gespeicherte Deutung, wird sie hier nachgeholt (derselbe Cache-Key wie das
 * Aspekt-Sheet, also genau EINE Erzeugung pro Verbindung, danach sofort da).
 */
function RelationRow({ r, onOpen }: { r: SheetRelation; onOpen: () => void }) {
  const st = subjectTask({ kind: "aspect", key: r.key });
  const { text: gen } = useReading(st?.viewKey ?? "", st?.task ?? "", !!st && !IS_DEMO && r.source !== "ai");
  const zeile = r.source === "ai" ? r.text : gen ? firstSentence(gen) : r.text;
  return (
    <button
      onClick={onOpen}
      className="group -mx-2.5 flex items-start gap-3 rounded-[14px] border-t border-line-soft px-2.5 py-3.5 text-left transition first:border-t-0 hover:bg-surface"
    >
      <span className="vela-glyph mt-[3px] text-base leading-none" style={{ color: r.color }}>
        {r.glyph}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-body text-[13px] font-medium leading-snug text-txt">{r.label}</div>
        <p className="mt-1.5 font-body text-[13px] leading-[1.6] text-txt-2">{zeile}</p>
      </div>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-txt-3 transition group-hover:text-lilac" />
    </button>
  );
}

/** The shared content (title + was/wie/wo + relations) for both surfaces. */
function Body({ content, descriptor }: { content: SheetContent; descriptor: SheetDescriptor | null }) {
  const openSheet = useApp((s) => s.openSheet);
  const closeSheet = useApp((s) => s.closeSheet);
  const setComposerOpen = useApp((s) => s.setComposerOpen);
  const setQ = useApp((s) => s.setQ);
  const ask = useApp((s) => s.ask);
  const talkToVela = () => {
    const q = `Erzähl mir mehr über „${content.title}" in meinem Chart — was bedeutet das konkret für mich?`;
    setQ(q);
    closeSheet();
    setComposerOpen(true);
    void ask(q);
  };
  const st = subjectTask(descriptor);
  const stored = storedReading(descriptor);
  const { text: genText, loading: genLoading } = useReading(st?.viewKey ?? "", st?.task ?? "", !!st && !IS_DEMO);
  const personalText = stored || genText;

  // Lexikon (gilt für jeden) vs. echte Deutung (gilt nur für DIESES Chart).
  // Nur echte Deutungen dürfen in den „Vela deutet · für dich"-Block — vorher
  // landeten dort die generischen Zeichen-/Haus-Zeilen (Aszendent, Mondknoten)
  // und lasen sich bei jedem Kunden gleich.
  const isGeneral = (s: { accent?: string; source?: string }) => !s.accent && s.source !== "ai";
  const general = content.sections.filter((s) => isGeneral(s) && /^was|^klartext/i.test(s.label));
  const notes = content.sections.filter((s) => isGeneral(s) && !/^was|^klartext/i.test(s.label));
  const placements = content.sections.filter((s) => !s.accent && s.source === "ai");
  const personal = content.sections.filter((s) => s.accent);
  // Liegt die volle Deutung (Zeichen + Haus) vor, steht sie IM Deutungs-Block
  // statt als dünne Zeilen darüber. Fehlt sie, füllt die generierte
  // Craft-Deutung den Block.
  const foldPersonal = placements.length > 0;

  // Foto-Hero für Planeten — das Original aus Design.fig, screen-geblendet auf
  // dunkler Karte mit tonalem Glow (App-Konzept: PlanetPhotoCard).
  const planetKey = descriptor?.kind === "planet" ? descriptor.key : null;
  const photo = planetKey ? PLANET_PHOTO[planetKey] : null;
  const glow = (planetKey && PLANET_GLOW[planetKey]) || "120,150,255";
  const scale = (planetKey && PLANET_SCALE[planetKey]) || 0.6;

  return (
    <>
      {photo ? (
        /* Foto-Card: Planet full-bleed (oben/unten angeschnitten), Glyph oben,
           Headline IN der Card unten über einem Scrim. */
        <div
          className="relative mb-5 h-[220px] overflow-hidden rounded-[20px]"
          style={{
            background: "linear-gradient(180deg,#191728 0%,#141221 58%,#100E1A 100%)",
            boxShadow: `inset 0 0 0 1px rgba(${glow},.22)`,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 340,
              height: 340,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${glow},.4) 0%, rgba(${glow},.1) 46%, transparent 68%)`,
              mixBlendMode: "screen",
            }}
          />
          <img
            src={photo}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            style={{ mixBlendMode: "screen", transform: `scale(${1.06 + scale * 0.24})`, filter: "drop-shadow(0 8px 26px rgba(0,0,6,.5))" }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[66%]"
            style={{ background: "linear-gradient(180deg, transparent 0%, rgba(11,9,16,.5) 52%, rgba(11,9,16,.94) 100%)" }}
          />
          <span
            aria-hidden
            className="vela-glyph absolute left-4 top-3.5 text-[20px]"
            style={{ color: `rgba(${glow},.95)`, filter: "drop-shadow(0 1px 6px rgba(0,0,0,.7))" }}
          >
            {content.glyph}
          </span>
          <h2 className="absolute inset-x-4 bottom-4 pr-10 font-cinzel text-[23px] font-normal uppercase not-italic leading-[1.06] tracking-[0.02em] text-txt">
            {content.title}
          </h2>
        </div>
      ) : (
        <div className="flex items-center gap-3.5 pr-8">
          <GlyphBadge glyph={content.glyph} size={46} />
          <h2 className="font-cinzel text-[22px] font-normal uppercase not-italic leading-[1.1] tracking-[0.02em] text-txt">{content.title}</h2>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-7">
        {/* GENERAL — die Lexikon-Stimme: ruhig, aufrecht (nie kursiv), in
            Absätzen statt als Wand */}
        {general.map((sec) => (
          <div key={sec.label}>
            <div className="mb-2.5 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-txt-3">{sec.label}</div>
            <Prose text={sec.body} />
          </div>
        ))}

        {/* SYSTEM — warum dieses Haus, wie genau der Winkel: Lehrstoff, keine
            persönliche Deutung. Steht deshalb ÜBER dem Deutungs-Block. */}
        {notes.length > 0 && (
          <div className="space-y-5 border-t border-line-soft pt-6">
            {notes.map((sec) => (
              <div key={sec.label} className="grid grid-cols-[auto_1fr] gap-x-3.5">
                <div className="mt-1 h-full w-[2px] rounded-full bg-gradient-to-b from-lilac/70 to-violet/20" />
                <div>
                  <div className="mb-1.5 font-display text-[13px] font-semibold leading-snug tracking-[-0.01em] text-lilac">{sec.label}</div>
                  <Prose text={sec.body} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PERSONAL — Vela's generated reading (grounded in the chart), or the
            template "Bei dir" for views that aren't a single subject (signs/houses) */}
        {st ? (
          <DeutungBox label={<><Sparkles className="h-3.5 w-3.5" /> Vela deutet · für dich</>}>
            {foldPersonal ? (
              <div className="space-y-4">
                {placements.map((sec) => (
                  <div key={sec.label}>
                    <div className="mb-1.5 font-display text-[13px] font-semibold leading-snug tracking-[-0.01em] text-mint/90">{sec.label}</div>
                    <Prose text={sec.body} tone="loud" />
                  </div>
                ))}
              </div>
            ) : personalText ? (
              <Prose text={personalText} tone="loud" />
            ) : genLoading ? (
              <div className="flex items-center gap-2 text-txt-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="font-body text-[13px]">Vela liest dein Bild …</span></div>
            ) : (
              <Prose text={personal[0]?.body ?? "Tippe erneut, um die Deutung zu laden."} tone="loud" />
            )}
          </DeutungBox>
        ) : (
          personal.map((sec) => (
            <DeutungBox
              key={sec.label}
              label={
                <>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_6px_rgba(32,240,208,0.8)]" />
                  {sec.label}
                </>
              }
            >
              <Prose text={sec.body} tone="loud" />
            </DeutungBox>
          ))
        )}

        <button
          onClick={talkToVela}
          className="flex w-full items-center justify-center gap-2 rounded-pill bg-card px-4 py-3.5 font-display text-[13px] font-semibold text-lilac shadow-[inset_0_0_0_1px_rgba(var(--rgb-iris),0.32)] transition hover:bg-surface-2 active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4" /> Mit Vela darüber sprechen
        </button>

        {content.relations && content.relations.length > 0 && (
          <div className="border-t border-line-soft pt-6">
            <div className="mb-2 font-body text-[11px] font-medium uppercase tracking-[0.18em] text-txt-3">Verbindungen</div>
            <div className="flex flex-col">
              {content.relations.map((r) => (
                <RelationRow key={r.key} r={r} onOpen={() => openSheet({ kind: "aspect", key: r.key })} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function SheetHost() {
  const sheet = useApp((s) => s.sheet);
  const anchor = useApp((s) => s.anchor);
  const closeSheet = useApp((s) => s.closeSheet);
  const isDesktop = useIsDesktop();

  const content = sheet ? resolveSheet(sheet) : null;
  if (!content) return null;

  // ── desktop: a popover that opens at the click, like a tooltip ──
  if (isDesktop) {
    const W = 340;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const ax = anchor?.x ?? vw / 2;
    const ay = anchor?.y ?? vh / 2;
    const left = Math.min(Math.max(16, ax + 14), vw - W - 16);
    const top = Math.min(Math.max(16, ay - 20), vh * 0.5);
    return (
      <div style={{ zIndex: LAYER.sheetScrim }} className="fixed inset-0" onClick={closeSheet}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: "fixed", left, top, width: W }}
          className="vela-glass max-h-[72vh] overflow-y-auto rounded-2xl p-5 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.85)]"
        >
          <button
            onClick={closeSheet}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-txt-3 transition hover:text-txt"
          >
            <X className="h-4 w-4" />
          </button>
          <Body content={content} descriptor={sheet} />
        </div>
      </div>
    );
  }

  // ── mobile: the bottom sheet ──
  return (
    <Sheet open={!!content} onOpenChange={(o) => !o && closeSheet()}>
      <SheetShell>
        <Body content={content} descriptor={sheet} />
      </SheetShell>
    </Sheet>
  );
}
