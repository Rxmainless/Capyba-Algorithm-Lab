import type { Frame } from "../../types";

export function* linearSearch(input: number[], target: number): Generator<Frame> {
  const array = [...input];
  let comparisons = 0;
  let memoryAccesses = 0;

  for (let i = 0; i < array.length; i++) {
    comparisons++;
    memoryAccesses++;
    const remaining = array.length - i - 1;
    const eliminated = Array.from({ length: i }, (_, k) => k);

    if (array[i] === target) {
      yield {
        array: [...array],
        highlightedIndices: [i],
        eliminatedIndices: eliminated,
        action: "found",
        narrative: `Encontrado! A posição ${i} guarda o valor ${target}, após ${comparisons} comparação${comparisons > 1 ? "ões" : ""}.`,
        callStack: [`linearSearch(target=${target})`],
        metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(n)" },
        codeLine: 4,
      };
      return;
    }

    yield {
      array: [...array],
      highlightedIndices: [i],
      eliminatedIndices: eliminated,
      action: "probe",
      narrative:
        remaining > 0
          ? `Posição ${i} (valor ${array[i]}) não é ${target}. Restam ${remaining} posição${remaining > 1 ? "ões" : ""} para verificar.`
          : `Posição ${i} (valor ${array[i]}) não é ${target}. Essa era a última posição do array.`,
      callStack: [`linearSearch(target=${target})`],
      metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(n)" },
      codeLine: 3,
    };
  }

  yield {
    array: [...array],
    highlightedIndices: [],
    eliminatedIndices: Array.from({ length: array.length }, (_, k) => k),
    action: "compare",
    narrative: `Todas as ${array.length} posições foram verificadas: ${target} não está presente no array.`,
    callStack: [],
    metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(n)" },
    codeLine: 5,
  };
}