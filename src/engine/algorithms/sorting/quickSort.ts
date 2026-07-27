import type { Frame } from "../../types";

interface Metrics {
  comparisons: number;
  swaps: number;
  memoryAccesses: number;
}

function makeFrame(
  array: number[],
  highlightedIndices: number[],
  action: Frame["action"],
  narrative: string,
  callStack: string[],
  metrics: Metrics,
  codeLine: number
): Frame {
  return {
    array: [...array],
    highlightedIndices,
    action,
    narrative,
    callStack: [...callStack],
    metrics: { ...metrics, estimatedComplexity: "O(n log n) avg / O(n²) worst" },
    codeLine,
  };
}

function* partition(
  array: number[],
  low: number,
  high: number,
  stack: string[],
  metrics: Metrics
): Generator<Frame, number> {
  const pivot = array[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    metrics.comparisons++;
    metrics.memoryAccesses += 2;

    yield makeFrame(
      array, [j, high], "compare",
      `Comparando o elemento na posição ${j} com o pivô (posição ${high}, valor ${pivot}).`,
      stack, metrics, 9
    );

    if (array[j] < pivot) {
      i++;
      if (i !== j) {
        [array[i], array[j]] = [array[j], array[i]];
        metrics.swaps++;
        metrics.memoryAccesses += 2;

        yield makeFrame(
          array, [i, j], "swap",
          `Elemento menor que o pivô. Movendo-o para a região dos menores (posição ${i}).`,
          stack, metrics, 10
        );
      }
    }
  }

  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  metrics.swaps++;
  metrics.memoryAccesses += 2;

  yield makeFrame(
    array, [i + 1, high], "swap",
    `Posicionando o pivô no lugar definitivo (posição ${i + 1}). Esquerda = menores, direita = maiores.`,
    stack, metrics, 11
  );

  return i + 1;
}

function* quickSortHelper(
  array: number[],
  low: number,
  high: number,
  stack: string[],
  metrics: Metrics
): Generator<Frame> {
  if (low >= high) return;

  stack.push(`quickSort(${low}, ${high})`);
  yield makeFrame(
    array, [low, high], "call",
    `Nova chamada recursiva para o intervalo [${low}, ${high}].`,
    stack, metrics, 1
  );

  const pivotIndex = yield* partition(array, low, high, stack, metrics);

  yield* quickSortHelper(array, low, pivotIndex - 1, stack, metrics);
  yield* quickSortHelper(array, pivotIndex + 1, high, stack, metrics);

  yield makeFrame(
    array, [], "return",
    `Retornando de quickSort(${low}, ${high}) — intervalo já ordenado.`,
    stack, metrics, 5
  );
  stack.pop();
}

export function* quickSort(input: number[]): Generator<Frame> {
  const array = [...input];
  const metrics: Metrics = { comparisons: 0, swaps: 0, memoryAccesses: 0 };
  const stack: string[] = [];

  yield* quickSortHelper(array, 0, array.length - 1, stack, metrics);

  yield makeFrame(array, [], "idle", "O array está completamente ordenado.", [], metrics, 2);
}