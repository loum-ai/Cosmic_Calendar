import { create } from "zustand";
import type { SheetDescriptor } from "@/lib/sheets";
import { localOracle } from "@/lib/oracle";

export type TabKey = "heute" | "transite" | "synastrie" | "lernen" | "profil";

const TAB_ORDER: TabKey[] = ["heute", "transite", "synastrie", "lernen", "profil"];

export interface AppState {
  tab: TabKey;
  tabDir: 1 | -1; // 1 = slide from right, -1 = slide from left
  setTab: (t: TabKey) => void;

  // tap-to-understand bottom sheet
  sheet: SheetDescriptor | null;
  openSheet: (s: SheetDescriptor) => void;
  closeSheet: () => void;

  // Q&A composer (the product hook — reachable everywhere)
  composerOpen: boolean;
  setComposerOpen: (v: boolean) => void;
  q: string;
  setQ: (v: string) => void;
  answer: string;
  demo: boolean; // true when the answer came from the local offline oracle
  loading: boolean;
  ask: (question?: string) => Promise<void>;
  clearAnswer: () => void;

  // help modal
  showHelp: boolean;
  setShowHelp: (v: boolean) => void;

  // Klartext mode — plain language instead of jargon
  klartext: boolean;
  toggleKlartext: () => void;

  // first-launch coach hint ("Tippe alles, was leuchtet")
  coachSeen: boolean;
  dismissCoach: () => void;

  // lernen category
  learnCat: string;
  setLearnCat: (c: string) => void;

  // transite full-screen index
  fullTransit: number | null;
  setFullTransit: (i: number | null) => void;
}

export const useApp = create<AppState>((set, get) => ({
  tab: "heute",
  tabDir: 1,
  setTab: (t) =>
    set((s) => {
      const dir = TAB_ORDER.indexOf(t) >= TAB_ORDER.indexOf(s.tab) ? 1 : -1;
      return { tab: t, tabDir: dir };
    }),

  sheet: null,
  openSheet: (s) => set({ sheet: s }),
  closeSheet: () => set({ sheet: null }),

  composerOpen: false,
  setComposerOpen: (v) => set({ composerOpen: v }),
  q: "",
  setQ: (v) => set({ q: v }),
  answer: "",
  demo: false,
  loading: false,
  clearAnswer: () => set({ answer: "", demo: false }),
  ask: async (question) => {
    const q = (question ?? get().q).trim();
    if (!q || get().loading) return;
    set({ loading: true, answer: "", demo: false, q });
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { answer?: string };
      set({ answer: data.answer || localOracle(q), demo: !data.answer, loading: false });
    } catch {
      // No backend (e.g. static GitHub Pages) — answer locally from the chart.
      set({ answer: localOracle(q), demo: true, loading: false });
    }
  },

  showHelp: false,
  setShowHelp: (v) => set({ showHelp: v }),

  klartext: false,
  toggleKlartext: () => set((s) => ({ klartext: !s.klartext })),

  coachSeen: false,
  dismissCoach: () => set({ coachSeen: true }),

  learnCat: "lplaneten",
  setLearnCat: (c) => set({ learnCat: c }),

  fullTransit: null,
  setFullTransit: (i) => set({ fullTransit: i }),
}));
