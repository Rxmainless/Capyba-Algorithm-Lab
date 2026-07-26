import { algorithms } from "../../engine/algorithms/registry";

interface AlgorithmSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  onNewArray: () => void;
}

export function AlgorithmSelector({ selectedId, onSelect, onNewArray }: AlgorithmSelectorProps) {
  return (
    <div className="flex items-center gap-3 font-mono text-sm">
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-panel text-white rounded px-3 py-1.5 border border-text-secondary/30"
      >
        {algorithms.map((algo) => (
          <option key={algo.id} value={algo.id}>
            {algo.name}
          </option>
        ))}
      </select>
      <button
        onClick={onNewArray}
        className="bg-panel text-accent-cyan rounded px-3 py-1.5 border border-text-secondary/30 hover:text-white"
      >
        New Array
      </button>
    </div>
  );
}