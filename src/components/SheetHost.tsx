import { useEffect, useState } from "react";
import { X, Loader2, Sparkles } from "lucide-react";
import { useApp } from "@/store/useApp";
import { resolveSheet, type SheetContent, type SheetDescriptor } from "@/lib/sheets";
import { Sheet, SheetContent as SheetShell } from "@/components/ui/sheet";
import { GlyphBadge } from "@/components/GlyphBadge";
import { subjectTask, useReading } from "@/lib/genReadings";

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

/** The shared content (title + was/wie/wo + relations) for both surfaces. */
function Body({ content, descriptor }: { content: SheetContent; descriptor: SheetDescriptor | null }) {
  const openSheet = useApp((s) => s.openSheet);
  const st = subjectTask(descriptor);
  const { text: genText, loading: genLoading } = useReading(st?.viewKey ?? "", st?.task ?? "", !!st);

  const general = content.sections.filter((s) => !s.accent && /^was/i.test(s.label));
  const placements = content.sections.filter((s) => !s.accent && !/^was/i.test(s.label));
  const personal = content.sections.filter((s) => s.accent);

  return (
    <>
      <div className="flex items-center gap-3.5 pr-8">
        <GlyphBadge glyph={content.glyph} size={46} />
        <h2 className="font-serif text-[26px] font-semibold leading-[1.05] tracking-[0.01em] text-white">{content.title}</h2>
      </div>

      <div className="mt-5 flex flex-col gap-6">
        {/* GENERAL — the encyclopedia voice: quiet, italic serif */}
        {general.map((sec) => (
          <div key={sec.label}>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-txt-3">{sec.label}</div>
            <p className="font-serif text-[18px] italic leading-[1.5] text-txt-2">{sec.body}</p>
          </div>
        ))}

        {/* PLACEMENTS — your data point: structured rows, label carries the position */}
        {placements.length > 0 && (
          <div className="space-y-4 border-t border-line pt-5">
            {placements.map((sec) => (
              <div key={sec.label} className="grid grid-cols-[auto_1fr] gap-x-3.5">
                <div className="mt-1 h-full w-[3px] rounded-full bg-gradient-to-b from-lilac/80 to-violet/30" />
                <div>
                  <div className="mb-1 font-display text-[12.5px] font-bold tracking-tight text-lilac">{sec.label}</div>
                  <p className="font-body text-[14px] leading-[1.6] text-txt-2">{sec.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PERSONAL — Vela's generated reading (grounded in the chart), or the
            template "Bei dir" for views that aren't a single subject (signs/houses) */}
        {st ? (
          <div className="rounded-2xl border border-mint/30 bg-mint/[0.07] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-mint">
              <Sparkles className="h-3.5 w-3.5" /> Vela deutet · für dich
            </div>
            {genText ? (
              <p className="font-body text-[16px] font-medium leading-[1.55] text-white">{genText}</p>
            ) : genLoading ? (
              <div className="flex items-center gap-2 text-txt-2"><Loader2 className="h-4 w-4 animate-spin" /><span className="font-body text-[13px]">Vela liest dein Bild …</span></div>
            ) : (
              <p className="font-body text-[15px] leading-[1.55] text-white">{personal[0]?.body ?? "Tippe erneut, um die Deutung zu laden."}</p>
            )}
          </div>
        ) : (
          personal.map((sec) => (
            <div key={sec.label} className="rounded-2xl border border-mint/25 bg-mint/[0.06] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-mint">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_6px_#2dd4bf]" />
                {sec.label}
              </div>
              <p className="font-body text-[16px] font-medium leading-[1.55] text-white">{sec.body}</p>
            </div>
          ))
        )}

        {content.relations && content.relations.length > 0 && (
          <div className="border-t border-line pt-5">
            <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-violet/75">Verbindungen</div>
            <div className="flex flex-col">
              {content.relations.map((r) => (
                <button
                  key={r.key}
                  onClick={() => openSheet({ kind: "aspect", key: r.key })}
                  className="flex items-start gap-2.5 border-t border-line-soft py-3 text-left transition first:border-t-0 hover:opacity-75"
                >
                  <span className="vela-glyph mt-0.5 text-base" style={{ color: r.color }}>
                    {r.glyph}
                  </span>
                  <div>
                    <div className="font-body text-[13.5px] font-medium text-txt">{r.label}</div>
                    <p className="mt-1 font-body text-[12.5px] leading-relaxed text-txt-3">{r.text}</p>
                  </div>
                </button>
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
      <div className="fixed inset-0 z-[70]" onClick={closeSheet}>
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
