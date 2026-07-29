import { describe, it, expect } from "vitest";
import { linearSearch } from "./linearSearch";
import { binarySearch } from "./binarySearch";

const algorithms = [
  { name: "linearSearch", run: linearSearch },
  { name: "binarySearch", run: binarySearch },
];

describe.each(algorithms)("$name", ({ run }) => {
  it("encontra um valor presente no array", () => {
    const frames = [...run([5, 2, 9, 1, 7], 9)];
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.action).toBe("found");
    expect(lastFrame.highlightedIndices.length).toBe(1);
  });

  it("retorna 'não encontrado' para valor ausente", () => {
    const frames = [...run([5, 2, 9, 1, 7], 999)];
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.action).toBe("compare");
    expect(lastFrame.highlightedIndices).toEqual([]);
  });

  it("nunca muta o array original recebido", () => {
    const original = [5, 2, 9, 1, 7];
    [...run(original, 9)];
    expect(original).toEqual([5, 2, 9, 1, 7]);
  });

  it("lida com array vazio sem quebrar", () => {
    expect([...run([], 5)].length).toBeGreaterThan(0);
  });
});