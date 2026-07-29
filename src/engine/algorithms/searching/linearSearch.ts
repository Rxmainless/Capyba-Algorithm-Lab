import type { Frame } from "../../types";

export function* linearSearch(input: number[], target: number): Generator<Frame> {
  const array = [...input];
  let comparisons = 0;
  let memoryAccesses = 0;

  for (let i = 0; i < array.length; i++) {
    comparisons++;
    memoryAccesses++;

    if (array[i] === target) {
      yield {
        array: [...array],
        highlightedIndices: [i],
        action: "swap",
        narrative: `Elemento encontrado na posição ${i}! O valor ${target} corresponde ao alvo da busca.`,
        callStack: [`linearSearch(target=${target})`],
        metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(n)" },
        codeLine: 4,
      };
      return;
    }

    yield {
      array: [...array],
      highlightedIndices: [i],
      action: "compare",
      narrative: `Verificando a posição ${i} (valor ${array[i]}): ainda não é o valor procurado (${target}).`,
      callStack: [`linearSearch(target=${target})`],
      metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(n)" },
      codeLine: 3,
    };
  }

  yield {
    array: [...array],
    highlightedIndices: [],
    action: "compare",
    narrative: `Busca concluída: o valor ${target} não está presente no array.`,
    callStack: [],
    metrics: { comparisons, swaps: 0, memoryAccesses, estimatedComplexity: "O(n)" },
    codeLine: 5,
  };
}