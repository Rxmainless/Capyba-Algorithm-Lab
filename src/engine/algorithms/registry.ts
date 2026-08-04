import type { Frame } from "../types";
import { bubbleSort } from "./sorting/bubbleSort";
import { quickSort } from "./sorting/quickSort";
import { insertionSort } from "./sorting/insertionSort";
import { selectionSort } from "./sorting/selectionSort";
import { mergeSort } from "./sorting/mergeSort";
import { heapSort } from "./sorting/heapSort";
import { countingSort } from "./sorting/countingSort";
import { radixSort } from "./sorting/radixSort";
import { linearSearch } from "./searching/linearSearch";
import { binarySearch } from "./searching/binarySearch";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface AlgorithmDefinition {
  id: string;
  name: string;
  category: string;
  difficulty: Difficulty;
  requiresTarget?: boolean;
  run: (input: number[], target: number) => Generator<Frame>;
}

export const algorithms: AlgorithmDefinition[] = [
  { id: "linear-search", name: "Linear Search", category: "Busca", difficulty: "beginner", requiresTarget: true, run: linearSearch },
  { id: "bubble-sort", name: "Bubble Sort", category: "Ordenação", difficulty: "beginner", run: bubbleSort },
  { id: "selection-sort", name: "Selection Sort", category: "Ordenação", difficulty: "beginner", run: selectionSort },
  { id: "insertion-sort", name: "Insertion Sort", category: "Ordenação", difficulty: "intermediate", run: insertionSort },
  { id: "binary-search", name: "Binary Search", category: "Busca", difficulty: "intermediate", requiresTarget: true, run: binarySearch },
  { id: "quick-sort", name: "Quick Sort", category: "Ordenação", difficulty: "advanced", run: quickSort },
  { id: "merge-sort", name: "Merge Sort", category: "Ordenação", difficulty: "advanced", run: mergeSort },
  { id: "heap-sort", name: "Heap Sort", category: "Ordenação", difficulty: "advanced", run: heapSort },
  { id: "counting-sort", name: "Counting Sort", category: "Ordenação", difficulty: "advanced", run: countingSort },
  { id: "radix-sort", name: "Radix Sort", category: "Ordenação", difficulty: "advanced", run: radixSort },
];

export function getAlgorithmById(id: string): AlgorithmDefinition {
  const algo = algorithms.find((a) => a.id === id);
  if (!algo) throw new Error(`Algorithm "${id}" not found in registry.`);
  return algo;
}