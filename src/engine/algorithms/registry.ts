import type { Frame } from "../types";
import { bubbleSort } from "./sorting/bubbleSort";
import { quickSort } from "./sorting/quickSort";

export interface AlgorithmDefinition {
  id: string;
  name: string;
  category: string;
  run: (input: number[]) => Generator<Frame>;
}

export const algorithms: AlgorithmDefinition[] = [
  { id: "bubble-sort", name: "Bubble Sort", category: "Sorting", run: bubbleSort },
  { id: "quick-sort", name: "Quick Sort", category: "Sorting", run: quickSort },
];

export function getAlgorithmById(id: string): AlgorithmDefinition {
  const algo = algorithms.find((a) => a.id === id);
  if (!algo) throw new Error(`Algorithm "${id}" not found in registry.`);
  return algo;
}