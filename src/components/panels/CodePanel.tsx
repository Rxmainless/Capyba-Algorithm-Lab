import { useExecutionStore } from "../../store/executionStore";
import { pseudocode } from "../../engine/pseudocode";

interface CodePanelProps {
  algorithmId: string;
}

export function CodePanel({ algorithmId }: CodePanelProps) {
  const frame = useExecutionStore((s) => s.frames[s.currentIndex]);
  const lines = pseudocode[algorithmId] ?? [];
  const activeLine = frame?.codeLine;

  return (
    <div className="bg-panel rounded-lg p-4 font-mono text-xs overflow-x-auto">
      <h3 className="text-xs text-text-secondary uppercase tracking-wide mb-2">Code</h3>
      <ol className="space-y-0.5">
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const isActive = lineNumber === activeLine;
          return (
            <li
              key={lineNumber}
              className={`whitespace-pre px-2 py-0.5 rounded ${
                isActive ? "bg-accent-amber/20 text-accent-amber" : "text-text-secondary"
              }`}
            >
              <span className="inline-block w-5 text-right mr-2 opacity-50">{lineNumber}</span>
              {line || " "}
            </li>
          );
        })}
      </ol>
    </div>
  );
}