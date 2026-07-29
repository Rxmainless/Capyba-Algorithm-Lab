import type { Frame } from "../types";
import { bubbleSort } from "./sorting/bubbleSort";
import { quickSort } from "./sorting/quickSort";
import { insertionSort } from "./sorting/insertionSort";
import { selectionSort } from "./sorting/selectionSort";
import { mergeSort } from "./sorting/mergeSort";
import { heapSort } from "./sorting/heapSort";
import { linearSearch } from "./searching/linearSearch";
import { binarySearch } from "./searching/binarySearch";

export interface AlgorithmDefinition {
  id: string;
  name: string;
  category: string;
  requiresTarget?: boolean;
  run: (input: number[], target: number) => Generator<Frame>;
}

export const algorithms: AlgorithmDefinition[] = [
  { id: "bubble-sort", name: "Bubble Sort", category: "Ordenação", run: bubbleSort },
  { id: "selection-sort", name: "Selection Sort", category: "Ordenação", run: selectionSort },
  { id: "insertion-sort", name: "Insertion Sort", category: "Ordenação", run: insertionSort },
  { id: "quick-sort", name: "Quick Sort", category: "Ordenação", run: quickSort },
  { id: "merge-sort", name: "Merge Sort", category: "Ordenação", run: mergeSort },
  { id: "heap-sort", name: "Heap Sort", category: "Ordenação", run: heapSort },
  { id: "linear-search", name: "Linear Search", category: "Busca", requiresTarget: true, run: linearSearch },
  { id: "binary-search", name: "Binary Search", category: "Busca", requiresTarget: true, run: binarySearch },
];

export function getAlgorithmById(id: string): AlgorithmDefinition {
  const algo = algorithms.find((a) => a.id === id);
  if (!algo) throw new Error(`Algorithm "${id}" not found in registry.`);
  return algo;
}