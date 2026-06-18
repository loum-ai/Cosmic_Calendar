import { useApp } from "@/store/useApp";
import { cn } from "@/lib/utils";

/**
 * Klartext-Modus toggle. Flips jargon labels to plain German app-wide —
 * the user's most-repeated request ("nicht astrologie sprache"), made a
 * visible, delightful control.
 */
export function KlartextToggle() {
  const klartext = useApp((s) => s.klartext);
  const toggle = useApp((s) => s.toggleKlartext);
  return (
    <button
      onClick={toggle}
      title="Astrologie-Begriffe in Klartext übersetzen"
      className={cn(
        "flex items-center gap-2 rounded-pill border px-3 py-1.5 font-body text-[11px] transition active:scale-95",
        klartext
          ? "border-mint/50 bg-mint/15 text-mint-soft"
          : "border-lilac/30 bg-white/[0.06] text-ink-soft/70",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition",
          klartext ? "bg-mint shadow-[0_0_6px_#2fde8c]" : "bg-ink-soft/40",
        )}
      />
      Klartext
    </button>
  );
}
