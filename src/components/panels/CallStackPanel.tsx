import { useExecutionStore } from "../../store/executionStore";

export function CallStackPanel() {
  const frame = useExecutionStore((s) => s.frames[s.currentIndex]);
  const stack = frame?.callStack ?? [];

  return (
    <div className="bg-panel rounded-lg p-4 font-mono text-sm h-40 overflow-y-auto">
      <h3 className="text-xs text-text-secondary uppercase tracking-wide mb-2">Call Stack</h3>
      {stack.length === 0 ? (
        <p className="text-text-secondary">empty</p>
      ) : (
        <ul>
          {stack.map((call, i) => (
            <li
              key={i}
              style={{ paddingLeft: `${i * 16}px` }}
              className={i === stack.length - 1 ? "text-accent-amber" : "text-text-secondary"}
            >
              {i === stack.length - 1 ? "▸ " : "└─ "}{call}
              {i === stack.length - 1 && <span className="animate-pulse">▍</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}