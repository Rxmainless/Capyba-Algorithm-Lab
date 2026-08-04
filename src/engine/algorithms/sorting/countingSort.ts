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
  eliminated: number[],
  metrics: Metrics,
  codeLine: number
): Frame {
  return {
    array: [...array],
    highlightedIndices: highlighted,
    action,
    narrative,
    callStack: [],
    metrics: { ...metrics, estimatedComplexity: "O(n + k)" },
    codeLine,
    eliminatedIndices: eliminated,
  };
}

export function* countingSort(input: number[]): Generator<Frame> {
  const array = [...input];
  const n = array.length;
  const metrics: Metrics = { comparisons: 0, swaps: 0, memoryAccesses: 0 };

  if (n === 0) {
    yield frame(array, [], "idle", "O array está completamente ordenado.", [], metrics, 7);
    return;
  }

  const max = Math.max(...array);
  const count = new Array(max + 1).fill(0);

  for (let i = 0; i < n; i++) {
    count[array[i]]++;
    metrics.memoryAccesses++;
    yield frame(
      array,
      [i],
      "probe",
      `Contando a ocorrência do valor ${array[i]}. Counting Sort não compara elementos — apenas conta quantas vezes cada valor aparece.`,
      [],
      metrics,
      2
    );
  }

  yield frame(
    array,
    [],
    "call",
    "Acumulando as contagens: cada posição passa a indicar quantos elementos são menores ou iguais a ela.",
    [],
    metrics,
    3
  );

  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
  }

  const output = new Array(n).fill(0);
  let eliminated = Array.from({ length: n }, (_, i) => i);

  for (let i = n - 1; i >= 0; i--) {
    const value = array[i];
    count[value]--;
    const targetIndex = count[value];
    output[targetIndex] = value;
    metrics.swaps++;
    metrics.memoryAccesses++;
    eliminated = eliminated.filter((idx) => idx !== targetIndex);

    yield frame(
      output,
      [targetIndex],
      "swap",
      `O valor ${value} vai direto pra posição ${targetIndex}, calculada pela contagem acumulada — sem comparar com os vizinhos.`,
      [...eliminated],
      metrics,
      6
    );
  }

  yield frame(output, [], "idle", "O array está completamente ordenado.", [], metrics, 7);
}