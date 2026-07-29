export type FrameAction = "compare" | "swap" | "call" | "return" | "idle" | "probe" | "found";

export interface FrameMetrics {
  comparisons: number;
  swaps: number;
  memoryAccesses: number;
  estimatedComplexity: string;
}

export interface Frame {
  array: number[];
  highlightedIndices: number[];
  action: FrameAction;
  narrative: string;
  callStack: string[];
  metrics: FrameMetrics;
  codeLine: number;
  eliminatedIndices?: number[];
}