import type { Frame } from "../../types";

export function* insertionSort(input: number[]): Generator<Frame> {
  const array = [...input];
  let comparisons = 0;
  let swaps = 0;
  let memoryAccesses = 0;
  const n = array.length;

  for (let i = 1; i < n; i++) {
    let j = i;

    while (j > 0) {
      comparisons++;
      memoryAccesses += 2;

      yield {
        array: [...array],
        highlightedIndices: [j - 1, j],
        action: "compare",
        narrative: `Comparando o elemento na posição ${j} com o anterior (posição ${j - 1}) para encontrar a posição correta de inserção.`,
        callStack: [`insertionSort(i=${i})`],
        metrics: { comparisons, swaps, memoryAccesses, estimatedComplexity: "O(n²)" },
        codeLine: 3,
      };

      if (array[j - 1] <= array[j]) break;

      [array[j - 1], array[j]] = [array[j], array[j - 1]];
      swaps++;
      memoryAccesses += 2;

      yield {
        array: [...array],
        highlightedIndices: [j - 1, j],
        action: "swap",
        narrative: `Elemento fora de posição. Movendo-o uma posição para trás na sequência já ordenada.`,
        callStack: [`insertionSort(i=${i})`],
        metrics: { comparisons, swaps, memoryAccesses, estimatedComplexity: "O(n²)" },
        codeLine: 4,
      };

      j--;
    }
  }

  yield {
    array: [...array],
    highlightedIndices: [],
    action: "idle",
    narrative: "O array está completamente ordenado.",
    callStack: [],
    metrics: { comparisons, swaps, memoryAccesses, estimatedComplexity: "O(n²)" },
    codeLine: 6,
  };
}