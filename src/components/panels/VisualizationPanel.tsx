import { motion } from "framer-motion";
import { useExecutionStore } from "../../store/executionStore";

export function VisualizationPanel() {
  const frame = useExecutionStore((s) => s.frames[s.currentIndex]);
  if (!frame) return null;
  const max = Math.max(...frame.array, 1);
  const isComplete = frame.action === "idle" && frame.highlightedIndices.length === 0;

  return (
    <div className="flex-1 flex items-end justify-center gap-1 bg-bg p-6 rounded-lg">
      {frame.array.map((value, index) => {
        const isActive = frame.highlightedIndices.includes(index);
        const color = isComplete
          ? "var(--color-success)"
          : isActive
          ? frame.action === "swap" ? "var(--color-success)" : "var(--color-accent-amber)"
          : "var(--color-accent-cyan)";

        return (
          <div key={index} className="flex flex-col items-center gap-1">
            {isComplete && (
              <motion.span
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 15 }}
                className="text-success text-xs"
              >
                ✓
              </motion.span>
            )}
            <motion.div
              layout
              animate={{ backgroundColor: color }}
              transition={{
                layout: { type: "spring", stiffness: 300, damping: 30 },
                backgroundColor: { delay: isComplete ? index * 0.05 : 0, duration: 0.3 },
              }}
              className="w-8 rounded-t-sm flex items-end justify-center text-xs font-mono font-semibold"
              style={{ height: `${(value / max) * 220 + 20}px`, color: "var(--color-bg)" }}
            >
              {value}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}