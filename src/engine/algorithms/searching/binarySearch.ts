import type { Frame } from "../../types";

function eliminatedOutside(n: number, low: number, high: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i < low || i > high) result.push(i);
  }
  return result;
}

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
        eliminatedIndices: eliminatedOutside(array.length, low, high).filter((i) => i !== mid),
        action: "found",
        narrative: `Encontrado! O elemento do meio (posição ${mid}) é exatamente ${target}, após reduzir a busca a uma faixa de ${high - low + 1} posições.`,
        callStack: [`binarySearch(low=${low}, high=${high})`],
        metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(log n)" },
        codeLine: 6,
      };
      return;
    }

    if (array[mid] < target) {
      const newLow = mid + 1;
      yield {
        array: [...array],
        highlightedIndices: [mid],
        eliminatedIndices: eliminatedOutside(array.length, low, high),
        action: "probe",
        narrative: `${array[mid]} é menor que ${target}. A metade esquerda é descartada — nova faixa de busca: posições ${newLow} a ${high}.`,
        callStack: [`binarySearch(low=${low}, high=${high})`],
        metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(log n)" },
        codeLine: 8,
      };
      low = newLow;
    } else {
      const newHigh = mid - 1;
      yield {
        array: [...array],
        highlightedIndices: [mid],
        eliminatedIndices: eliminatedOutside(array.length, low, high),
        action: "probe",
        narrative: `${array[mid]} é maior que ${target}. A metade direita é descartada — nova faixa de busca: posições ${low} a ${newHigh}.`,
        callStack: [`binarySearch(low=${low}, high=${high})`],
        metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(log n)" },
        codeLine: 10,
      };
      high = newHigh;
    }
  }

  yield {
    array: [...array],
    highlightedIndices: [],
    eliminatedIndices: Array.from({ length: array.length }, (_, k) => k),
    action: "compare",
    narrative: `A faixa de busca chegou a zero: ${target} não está presente no array.`,
    callStack: [],
    metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(log n)" },
    codeLine: 11,
  };
}