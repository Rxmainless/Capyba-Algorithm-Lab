import { describe, it, expect } from "vitest";
import { insertionSort } from "./insertionSort";
import { selectionSort } from "./selectionSort";
import { mergeSort } from "./mergeSort";
import { heapSort } from "./heapSort";

const algorithms = [
  { name: "insertionSort", run: insertionSort },
  { name: "selectionSort", run: selectionSort },
  { name: "mergeSort", run: mergeSort },
  { name: "heapSort", run: heapSort },
];

describe.each(algorithms)("$name", ({ run }) => {
  it("ordena um array desordenado corretamente", () => {
    const frames = [...run([5, 2, 4, 1, 3])];
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.array).toEqual([1, 2, 3, 4, 5]);
    expect(lastFrame.action).toBe("idle");
  });

  it("nunca muta o array original recebido", () => {
    const original = [5, 2, 4, 1, 3];
    const consumed = [...run(original)];
    expect(consumed.length).toBeGreaterThan(0);
    expect(original).toEqual([5, 2, 4, 1, 3]);
  });

  it("lida com array vazio e de 1 elemento sem quebrar", () => {
    expect([...run([])].length).toBeGreaterThan(0);
    expect([...run([42])].length).toBeGreaterThan(0);
  });

  it("lida com array já ordenado", () => {
    const frames = [...run([1, 2, 3, 4, 5])];
    expect(frames[frames.length - 1].array).toEqual([1, 2, 3, 4, 5]);
  });

  it("lida com array com elementos duplicados", () => {
    const frames = [...run([3, 1, 3, 2, 1])];
    expect(frames[frames.length - 1].array).toEqual([1, 1, 2, 3, 3]);
  });
});