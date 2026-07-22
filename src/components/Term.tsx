import * as React from "react";
import { useApp } from "@/store/useApp";

/**
 * An inline jargon term. Renders the word with a dotted accent underline;
 * tapping opens its Klartext explanation (popover on desktop, sheet on
 * mobile) via the shared glossary sheet. Makes every term self-explaining.
 */
export function Term({ k, children }: { k: string; children: React.ReactNode }) {
  const openSheet = useApp((s) => s.openSheet);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openSheet({ kind: "glossary", key: k });
      }}
      className="underline decoration-violet/55 decoration-dotted underline-offset-[3px] transition hover:decoration-violet"
    >
      {children}
    </button>
  );
}
