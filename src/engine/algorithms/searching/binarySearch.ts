import type { Frame } from "../../types";

export function* binarySearch(input: number[], target: number): Generator<Frame> {
  const array = [...input].sort((a, b) => a - b);
  let comparisons = 0;
  let memoryAccesses = 0;
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons++;
    memoryAccesses++;

    if (array[mid] === target) {
      yield {
        array: [...array],
        highlightedIndices: [mid],
        action: "swap",
        narrative: `Elemento encontrado na posição ${mid}! O valor do meio (${array[mid]}) corresponde ao alvo (${target}).`,
        callStack: [`binarySearch(low=${low}, high=${high})`],
        metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(log n)" },
        codeLine: 6,
      };
      return;
    }

    yield {
      array: [...array],
      highlightedIndices: [mid],
      action: "compare",
      narrative: `Comparando o valor do meio (posição ${mid}, valor ${array[mid]}) com o alvo (${target}).`,
      callStack: [`binarySearch(low=${low}, high=${high})`],
      metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(log n)" },
      codeLine: 5,
    };

    if (array[mid] < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  yield {
    array: [...array],
    highlightedIndices: [],
    action: "compare",
    narrative: `Busca concluída: o valor ${target} não está presente no array.`,
    callStack: [],
    metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(log n)" },
    codeLine: 11,
  };
}