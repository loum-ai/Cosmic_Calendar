import { useApp } from "@/store/useApp";
import { resolveSheet } from "@/lib/sheets";
import { Sheet, SheetContent } from "@/components/ui/sheet";

/**
 * Single host for the tap-to-understand bottom sheet. Reads the active
 * descriptor from the store, resolves its content, and renders it. Tapping
 * a relation swaps the sheet in place.
 */
export function SheetHost() {
  const sheet = useApp((s) => s.sheet);
  const closeSheet = useApp((s) => s.closeSheet);
  const openSheet = useApp((s) => s.openSheet);

  const content = sheet ? resolveSheet(sheet) : null;

  return (
    <Sheet open={!!content} onOpenChange={(o) => !o && closeSheet()}>
      {content && (
        <SheetContent>
          <div className="flex items-center gap-3">
            <div
              className="vela-glyph flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-xl"
              style={{ color: content.color }}
            >
              {content.glyph}
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight text-ink">
              {content.title}
            </h2>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {content.sections.map((sec) => (
              <div key={sec.label}>
                <div
                  className="vela-eyebrow mb-1.5"
                  style={{ color: sec.accent || "rgba(196,166,255,0.85)" }}
                >
                  {sec.label}
                </div>
                <p className="font-body text-sm font-light leading-relaxed text-ink/75">
                  {sec.body}
                </p>
              </div>
            ))}

            {content.relations && content.relations.length > 0 && (
              <div className="mt-1">
                <div className="vela-eyebrow mb-2.5 text-lilac/85">Verbindungen</div>
                <div className="flex flex-col gap-3.5">
                  {content.relations.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => openSheet({ kind: "aspect", key: r.key })}
                      className="text-left transition active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="vela-glyph text-sm" style={{ color: r.color }}>
                          {r.glyph}
                        </span>
                        <span
                          className="border-b pb-px text-[13px]"
                          style={{ color: r.color, borderColor: `${r.color}66` }}
                        >
                          {r.label}
                        </span>
                        <span className="ml-auto text-sm" style={{ color: r.color }}>
                          →
                        </span>
                      </div>
                      <p className="mt-1 font-body text-xs font-light leading-relaxed text-ink/70">
                        {r.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
}
