import { motion } from "framer-motion";
import { useExecutionStore } from "../../store/executionStore";

export function VisualizationPanel() {
  const frame = useExecutionStore((s) => s.frames[s.currentIndex]);
  if (!frame) return null;
  const max = Math.max(...frame.array, 1);

  return (
    <div className="flex-1 flex items-end justify-center gap-1 bg-bg p-6 rounded-lg">
      {frame.array.map((value, index) => {
        const isActive = frame.highlightedIndices.includes(index);
        const color = isActive
          ? frame.action === "swap" ? "var(--color-success)" : "var(--color-accent-amber)"
          : "var(--color-accent-cyan)";

        return (
          <motion.div
            key={index}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-8 rounded-t-sm flex items-end justify-center text-xs font-mono font-semibold"
            style={{ height: `${(value / max) * 220 + 20}px`, backgroundColor: color, color: "var(--color-bg)" }}
          >
            {value}
          </motion.div>
        );
      })}
    </div>
  );
}