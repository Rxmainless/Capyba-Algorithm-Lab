import type { Frame } from "../../types";

export function* bubbleSort(input: number[]): Generator<Frame> {
  const array = [...input];
  let comparisons = 0;
  let swaps = 0;
  let memoryAccesses = 0;
  const n = array.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      memoryAccesses += 2;

      yield {
        array: [...array],
        highlightedIndices: [j, j + 1],
        action: "compare",
        narrative: `Comparando as posições ${j} e ${j + 1}: o algoritmo precisa saber qual dos dois elementos é maior para decidir se uma troca é necessária.`,
        callStack: [`bubbleSort(pass=${i})`],
        metrics: { comparisons, swaps, memoryAccesses, estimatedComplexity: "O(n²)" },
        codeLine: 3,
      };

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        swaps++;
        memoryAccesses += 2;

        yield {
          array: [...array],
          highlightedIndices: [j, j + 1],
          action: "swap",
          narrative: `Os elementos nas posições ${j} e ${j + 1} estavam fora de ordem. A troca corrige parcialmente a sequência.`,
          callStack: [`bubbleSort(pass=${i})`],
          metrics: { comparisons, swaps, memoryAccesses, estimatedComplexity: "O(n²)" },
          codeLine: 4,
        };
      }
    }
  }

  yield {
    array: [...array],
    highlightedIndices: [],
    action: "idle",
    narrative: "O array está completamente ordenado.",
    callStack: [],
    metrics: { comparisons, swaps, memoryAccesses, estimatedComplexity: "O(n²)" },
    codeLine: 5,
  };
}