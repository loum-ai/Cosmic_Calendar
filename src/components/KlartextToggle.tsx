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
        "flex items-center gap-2 rounded-pill border px-[18px] py-2 font-body text-[13px] font-medium transition active:scale-95",
        klartext
          ? "border-mint/50 bg-mint/15 text-mint-soft"
          : "border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] text-[rgba(139,92,246,0.9)]",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full transition",
          klartext ? "bg-mint shadow-[0_0_6px_#2dd4bf]" : "bg-[rgba(139,92,246,0.9)]",
        )}
      />
      Klartext
    </button>
  );
}
