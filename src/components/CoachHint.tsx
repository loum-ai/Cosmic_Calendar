import { AnimatePresence, motion } from "framer-motion";
import { useApp } from "@/store/useApp";

/**
 * First-launch coach hint. Appears once, gently, telling the user that
 * anything glowing is tappable — then never again (dismissed on first tap
 * of any Explainable element).
 */
export function CoachHint() {
  const coachSeen = useApp((s) => s.coachSeen);
  const dismiss = useApp((s) => s.dismissCoach);
  const tab = useApp((s) => s.tab);

  return (
    <AnimatePresence>
      {!coachSeen && tab === "heute" && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          onClick={dismiss}
          className="vela-glass fixed bottom-[178px] left-1/2 z-30 -translate-x-1/2 rounded-pill px-4 py-2 font-body text-[11px] tracking-wide text-lilac/85"
        >
          Tippe alles, was leuchtet ✦
        </motion.button>
      )}
    </AnimatePresence>
  );
}
