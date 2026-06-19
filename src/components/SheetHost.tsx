import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/store/useApp";
import { resolveSheet, type SheetContent } from "@/lib/sheets";
import { Sheet, SheetContent as SheetShell } from "@/components/ui/sheet";

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
function Body({ content }: { content: SheetContent }) {
  const openSheet = useApp((s) => s.openSheet);
  return (
    <>
      <div className="flex items-center gap-3 pr-8">
        <span className="vela-glyph text-2xl" style={{ color: content.color }}>
          {content.glyph}
        </span>
        <h2 className="font-display text-xl font-bold leading-tight text-txt">{content.title}</h2>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {content.sections.map((sec) => (
          <div key={sec.label}>
            <div className="vela-data-dim mb-1.5 uppercase" style={{ color: sec.accent || "var(--accent-primary)" }}>
              {sec.label}
            </div>
            <p className="font-body text-[13px] leading-relaxed text-txt-2">{sec.body}</p>
          </div>
        ))}

        {content.relations && content.relations.length > 0 && (
          <div className="mt-1">
            <div className="vela-data-dim mb-2 uppercase">Verbindungen</div>
            <div className="flex flex-col">
              {content.relations.map((r) => (
                <button
                  key={r.key}
                  onClick={() => openSheet({ kind: "aspect", key: r.key })}
                  className="flex items-start gap-2 border-t border-line-soft py-2.5 text-left transition first:border-t-0 hover:opacity-75"
                >
                  <span className="vela-glyph mt-0.5 text-sm" style={{ color: r.color }}>
                    {r.glyph}
                  </span>
                  <div>
                    <div className="font-body text-[13px] text-txt">{r.label}</div>
                    <p className="mt-0.5 font-body text-xs leading-relaxed text-txt-3">{r.text}</p>
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
          <Body content={content} />
        </div>
      </div>
    );
  }

  // ── mobile: the bottom sheet ──
  return (
    <Sheet open={!!content} onOpenChange={(o) => !o && closeSheet()}>
      <SheetShell>
        <Body content={content} />
      </SheetShell>
    </Sheet>
  );
}
