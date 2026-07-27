import { useExecutionStore } from "../../store/executionStore";

export function NarrativePanel() {
  const frame = useExecutionStore((s) => s.frames[s.currentIndex]);

  return (
    <div className="bg-panel rounded-lg p-4 min-h-27.5 flex flex-col">
      <h3 className="font-mono text-xs text-text-secondary uppercase tracking-wide mb-2">Narrative</h3>
      <p className="font-sans text-sm leading-relaxed">
        {frame?.narrative ?? "Aguardando execução..."}
      </p>
    </div>
  );
}