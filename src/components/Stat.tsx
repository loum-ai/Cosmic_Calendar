import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A small labelled stat tile (icon · label · value), like the data chips in
 * the space-app reference. Token-based — no inline literals.
 */
export function StatChip({
  icon,
  label,
  value,
  className,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("vela-glass flex flex-1 items-center gap-3 rounded-2xl px-4 py-3", className)}>
      {icon && <span className="shrink-0 text-violet">{icon}</span>}
      <div className="min-w-0">
        <div className="font-display text-sm font-semibold text-txt">{label}</div>
        <div className="truncate font-body text-[11px] text-txt-2">{value}</div>
      </div>
    </div>
  );
}

/** A horizontal group of stat chips that wraps cleanly. */
export function StatRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap gap-2.5", className)}>{children}</div>;
}
