import type { Frame } from "../../types";

interface Metrics {
  comparisons: number;
  swaps: number;
  memoryAccesses: number;
}

function frame(
  array: number[],
  highlighted: number[],
  action: Frame["action"],
  narrative: string,
  stack: string[],
  metrics: Metrics
): Frame {
  return {
    array: [...array],
    highlightedIndices: highlighted,
    action,
    narrative,
    callStack: [...stack],
    metrics: { ...metrics, estimatedComplexity: "O(n log n)" },
  };
}

function* merge(
  array: number[],
  low: number,
  mid: number,
  high: number,
  stack: string[],
  metrics: Metrics
): Generator<Frame> {
  const left = array.slice(low, mid + 1);
  const right = array.slice(mid + 1, high + 1);
  let i = 0, j = 0, k = low;

  while (i < left.length && j < right.length) {
    metrics.comparisons++;
    metrics.memoryAccesses += 2;

    yield frame(
      array,
      [low + i, mid + 1 + j],
      "compare",
      `Comparando as sub-listas ordenadas: elemento da esquerda (${left[i]}) com o da direita (${right[j]}).`,
      stack,
      metrics
    );

    if (left[i] <= right[j]) {
      array[k] = left[i];
      i++;
    } else {
      array[k] = right[j];
      j++;
    }
    metrics.swaps++;
    metrics.memoryAccesses++;

    yield frame(
      array,
      [k],
      "swap",
      `Posicionando o menor dos dois no array combinado, na posição ${k}.`,
      stack,
      metrics
    );
    k++;
  }

  while (i < left.length) {
    array[k] = left[i];
    metrics.memoryAccesses++;
    yield frame(array, [k], "swap", `Copiando o restante da sub-lista esquerda.`, stack, metrics);
    i++; k++;
  }

  while (j < right.length) {
    array[k] = right[j];
    metrics.memoryAccesses++;
    yield frame(array, [k], "swap", `Copiando o restante da sub-lista direita.`, stack, metrics);
    j++; k++;
  }
}

function* mergeSortHelper(
  array: number[],
  low: number,
  high: number,
  stack: string[],
  metrics: Metrics
): Generator<Frame> {
  if (low >= high) return;

  stack.push(`mergeSort(${low}, ${high})`);
  yield frame(array, [low, high], "call", `Dividindo o intervalo [${low}, ${high}] ao meio.`, stack, metrics);

  const mid = Math.floor((low + high) / 2);
  yield* mergeSortHelper(array, low, mid, stack, metrics);
  yield* mergeSortHelper(array, mid + 1, high, stack, metrics);
  yield* merge(array, low, mid, high, stack, metrics);

  yield frame(array, [], "return", `Sub-lista [${low}, ${high}] combinada e ordenada.`, stack, metrics);
  stack.pop();
}

export function* mergeSort(input: number[]): Generator<Frame> {
  const array = [...input];
  const metrics: Metrics = { comparisons: 0, swaps: 0, memoryAccesses: 0 };
  const stack: string[] = [];

  yield* mergeSortHelper(array, 0, array.length - 1, stack, metrics);

  yield frame(array, [], "idle", "O array está completamente ordenado.", [], metrics);
}