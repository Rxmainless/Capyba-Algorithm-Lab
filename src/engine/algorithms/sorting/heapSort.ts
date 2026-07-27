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

function* heapify(
  array: number[],
  size: number,
  root: number,
  stack: string[],
  metrics: Metrics
): Generator<Frame> {
  let largest = root;
  const left = 2 * root + 1;
  const right = 2 * root + 2;

  if (left < size) {
    metrics.comparisons++;
    yield frame(array, [largest, left], "compare", `Comparando o nó pai (posição ${largest}) com o filho esquerdo (posição ${left}) do heap.`, stack, metrics);
    if (array[left] > array[largest]) largest = left;
  }

  if (right < size) {
    metrics.comparisons++;
    yield frame(array, [largest, right], "compare", `Comparando o maior encontrado até agora com o filho direito (posição ${right}) do heap.`, stack, metrics);
    if (array[right] > array[largest]) largest = right;
  }

  if (largest !== root) {
    [array[root], array[largest]] = [array[largest], array[root]];
    metrics.swaps++;
    metrics.memoryAccesses += 2;

    yield frame(array, [root, largest], "swap", `Violação da propriedade de heap. Trocando o pai (posição ${root}) com o maior filho (posição ${largest}).`, stack, metrics);

    stack.push(`heapify(root=${largest})`);
    yield* heapify(array, size, largest, stack, metrics);
    stack.pop();
  }
}

export function* heapSort(input: number[]): Generator<Frame> {
  const array = [...input];
  const metrics: Metrics = { comparisons: 0, swaps: 0, memoryAccesses: 0 };
  const stack: string[] = [];
  const n = array.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    stack.push(`buildHeap(root=${i})`);
    yield frame(array, [i], "call", `Construindo o heap máximo: organizando o nó na posição ${i}.`, stack, metrics);
    yield* heapify(array, n, i, stack, metrics);
    stack.pop();
  }

  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    metrics.swaps++;
    metrics.memoryAccesses += 2;

    yield frame(array, [0, i], "swap", `Movendo o maior elemento (raiz do heap) para o final da região ainda não ordenada.`, stack, metrics);

    stack.push(`heapify(root=0)`);
    yield* heapify(array, i, 0, stack, metrics);
    stack.pop();
  }

  yield frame(array, [], "idle", "O array está completamente ordenado.", [], metrics);
}