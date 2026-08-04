const DURATIONS: Record<string, number> = {
  "bubble-sort": 20,
  "selection-sort": 18,
  "insertion-sort": 18,
  "quick-sort": 24,
  "merge-sort": 24,
  "heap-sort": 22,
  "counting-sort": 16,
  "radix-sort": 20,
  "linear-search": 14,
  "binary-search": 12,
};

const ARRAY_SIZES: Record<string, number> = {
  "linear-search": 14,
  "binary-search": 14,
};

export function getRecommendedDuration(algorithmId: string): number {
  return DURATIONS[algorithmId] ?? 20;
}

export function getRecordingArraySize(algorithmId: string): number {
  return ARRAY_SIZES[algorithmId] ?? 10;
}