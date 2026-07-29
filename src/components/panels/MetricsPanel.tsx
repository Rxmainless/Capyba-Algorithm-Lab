import { useExecutionStore } from "../../store/executionStore";

export function MetricsPanel() {
  const frame = useExecutionStore((s) => s.frames[s.currentIndex]);
  const m = frame?.metrics;
  const rows = [
    ["Comparações", m?.comparisons ?? 0],
    ["Trocas", m?.swaps ?? 0],
    ["Acessos à memória", m?.memoryAccesses ?? 0],
    ["Complexidade", m?.estimatedComplexity ?? "—"],
  ] as const;

  return (
    <div className="bg-panel rounded-lg p-4">
      <h3 className="font-mono text-xs text-text-secondary uppercase tracking-wide mb-2">Métricas</h3>
      <dl className="grid grid-cols-2 gap-y-1 font-mono text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-text-secondary">{label}</dt>
            <dd className="text-right text-accent-cyan">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}