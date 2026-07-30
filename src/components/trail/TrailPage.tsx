import { algorithms, type Difficulty } from "../../engine/algorithms/registry";
import { useProgressStore } from "../../store/progressStore";

interface TrailPageProps {
  onSelect: (id: string) => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const DIFFICULTY_ORDER: Difficulty[] = ["beginner", "intermediate", "advanced"];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: "text-success",
  intermediate: "text-accent-amber",
  advanced: "text-accent-violet",
};

export function TrailPage({ onSelect }: TrailPageProps) {
  const isCompleted = useProgressStore((s) => s.isCompleted);
  const completedCount = useProgressStore((s) => s.completedIds.length);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-mono text-base text-white mb-1">Trilha de Aprendizado</h2>
        <p className="font-sans text-sm text-text-secondary">
          {completedCount} de {algorithms.length} algoritmos concluídos
        </p>
      </div>

      {DIFFICULTY_ORDER.map((level) => (
        <div key={level}>
          <h3 className={`font-mono text-xs uppercase tracking-wide mb-2 ${DIFFICULTY_COLORS[level]}`}>
            {DIFFICULTY_LABELS[level]}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {algorithms
              .filter((a) => a.difficulty === level)
              .map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => onSelect(algo.id)}
                  className="bg-panel rounded-lg p-4 text-left border border-text-secondary/20 hover:border-accent-cyan/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm text-white">{algo.name}</span>
                    {isCompleted(algo.id) && <span className="text-success text-xs">✓</span>}
                  </div>
                  <span className="font-sans text-xs text-text-secondary">{algo.category}</span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}