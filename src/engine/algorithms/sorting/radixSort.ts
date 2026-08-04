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
  metrics: Metrics,
  codeLine: number
): Frame {
  return {
    array: [...array],
    highlightedIndices: highlighted,
    action,
    narrative,
    callStack: [...stack],
    metrics: { ...metrics, estimatedComplexity: "O(d · (n + k))" },
    codeLine,
  };
}

function digitName(exp: number): string {
  if (exp === 1) return "unidades";
  if (exp === 10) return "dezenas";
  if (exp === 100) return "centenas";
  return `10^${Math.log10(exp)}`;
}

export function* radixSort(input: number[]): Generator<Frame> {
  let current = [...input];
  const metrics: Metrics = { comparisons: 0, swaps: 0, memoryAccesses: 0 };
  const stack: string[] = [];

  if (current.length === 0) {
    yield frame(current, [], "idle", "O array está completamente ordenado.", [], metrics, 4);
    return;
  }

  const max = Math.max(...current);
  let exp = 1;
  let passNumber = 0;

  while (Math.floor(max / exp) > 0) {
    passNumber++;
    stack.push(`radixSort(pass=${passNumber}, casa=${digitName(exp)})`);

    yield frame(
      current,
      [],
      "call",
      `Passe ${passNumber}: ordenando agora pelo dígito da casa das ${digitName(exp)}.`,
      stack,
      metrics,
      3
    );

    const output = new Array(current.length).fill(0);
    const count = new Array(10).fill(0);

    for (const value of current) {
      count[Math.floor(value / exp) % 10]++;
      metrics.memoryAccesses++;
    }
    for (let d = 1; d < 10; d++) count[d] += count[d - 1];

    for (let i = current.length - 1; i >= 0; i--) {
      const digit = Math.floor(current[i] / exp) % 10;
      count[digit]--;
      const pos = count[digit];
      output[pos] = current[i];
      metrics.swaps++;
      metrics.memoryAccesses++;

      yield frame(
        output,
        [pos],
        "swap",
        `Dígito ${digit} (casa das ${digitName(exp)}) do valor ${current[i]} → posição ${pos} neste passe.`,
        stack,
        metrics,
        9
      );
    }

    current = output;
    yield frame(current, [], "return", `Passe ${passNumber} concluído — array reorganizado por esse dígito.`, stack, metrics, 10);
    stack.pop();
    exp *= 10;
  }

  yield frame(current, [], "idle", "O array está completamente ordenado.", [], metrics, 4);
}