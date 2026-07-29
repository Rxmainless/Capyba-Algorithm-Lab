import type { Frame } from "../../types";

export function* selectionSort(input: number[]): Generator<Frame> {
  const array = [...input];
  let comparisons = 0;
  let swaps = 0;
  let memoryAccesses = 0;
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      memoryAccesses += 2;

      yield {
        array: [...array],
        highlightedIndices: [minIndex, j],
        action: "compare",
        narrative: `Procurando o menor elemento restante. Comparando o menor encontrado até agora (posição ${minIndex}) com a posição ${j}.`,
        callStack: [`selectionSort(pass=${i})`],
        metrics: { comparisons, swaps, memoryAccesses, estimatedComplexity: "O(n²)" },
        codeLine: 4,
      };

      if (array[j] < array[minIndex]) minIndex = j;
    }

    if (minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      swaps++;
      memoryAccesses += 2;

      yield {
        array: [...array],
        highlightedIndices: [i, minIndex],
        action: "swap",
        narrative: `Menor elemento encontrado na posição ${minIndex}. Movendo-o para a posição ${i}, que já está sendo finalizada.`,
        callStack: [`selectionSort(pass=${i})`],
        metrics: { comparisons, swaps, memoryAccesses, estimatedComplexity: "O(n²)" },
        codeLine: 6,
      };
    }
  }

  yield {
    array: [...array],
    highlightedIndices: [],
    action: "idle",
    narrative: "O array está completamente ordenado.",
    callStack: [],
    metrics: { comparisons, swaps, memoryAccesses, estimatedComplexity: "O(n²)" },
    codeLine: 7,
  };
}