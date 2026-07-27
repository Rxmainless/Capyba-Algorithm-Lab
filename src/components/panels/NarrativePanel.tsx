import { useExecutionStore } from "../../store/executionStore";

export function NarrativePanel() {
  const frame = useExecutionStore((s) => s.frames[s.currentIndex]);

  return (
    <div className="bg-panel rounded-lg p-4 h-37.5 flex flex-col overflow-hidden">
      <h3 className="font-mono text-xs text-text-secondary uppercase tracking-wide mb-2">Narrative</h3>
      <p className="font-sans text-sm leading-relaxed line-clamp-4">
        {frame?.narrative ?? "Aguardando execução..."}
      </p>
    </div>
  );
}