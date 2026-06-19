import * as React from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/useApp";
import type { SheetDescriptor } from "@/lib/sheets";

interface ExplainableProps extends React.HTMLAttributes<HTMLDivElement> {
  sheet: SheetDescriptor;
  /** subtle glow that signals "this is tappable" */
  glow?: boolean;
  as?: "div" | "span";
}

/**
 * Universal tap-to-understand wrapper. Every planet, aspect, house, sign,
 * node and aspect-type in the app is wrapped in this — guaranteeing there
 * are no dead zones and that every explanation opens the same consistent
 * bottom sheet (user: "man muss auch alle verbindungen anklicken können").
 */
export function Explainable({
  sheet,
  glow = true,
  className,
  children,
  as = "div",
  ...props
}: ExplainableProps) {
  const openSheet = useApp((s) => s.openSheet);
  const openDetail = useApp((s) => s.openDetail);
  const dismissCoach = useApp((s) => s.dismissCoach);
  const Comp = as as React.ElementType;
  // planets & nodes open a full detail page; everything else the bottom sheet
  const open = () => {
    dismissCoach();
    if (sheet.kind === "planet" || sheet.kind === "node") openDetail(sheet);
    else openSheet(sheet);
  };
  return (
    <Comp
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className={cn(
        "cursor-pointer outline-none transition-all duration-200 active:scale-[0.96] focus-visible:ring-1 focus-visible:ring-lilac/60",
        glow && "data-[glow=true]:drop-shadow-[0_0_7px_rgba(180,150,250,0.6)]",
        className,
      )}
      data-glow={glow}
      {...props}
    >
      {children}
    </Comp>
  );
}
