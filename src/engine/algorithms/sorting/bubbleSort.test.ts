import { describe, it, expect } from "vitest";
import { bubbleSort } from "./bubbleSort";

describe("bubbleSort", () => {
  it("ordena um array desordenado corretamente no frame final", () => {
    const frames = [...bubbleSort([5, 2, 4, 1])];
    const lastFrame = frames[frames.length - 1];

    expect(lastFrame.array).toEqual([1, 2, 4, 5]);
    expect(lastFrame.action).toBe("idle");
  });

  it("nunca muta o array original recebido", () => {
    const original = [5, 2, 4, 1];
    [...bubbleSort(original)]; // consome todos os frames

    expect(original).toEqual([5, 2, 4, 1]); // deve continuar intacto
  });

  it("gera pelo menos um frame de comparação e um de troca", () => {
    const frames = [...bubbleSort([3, 1])];
    const hasCompare = frames.some((f) => f.action === "compare");
    const hasSwap = frames.some((f) => f.action === "swap");

    expect(hasCompare).toBe(true);
    expect(hasSwap).toBe(true);
  });

  it("já retorna array ordenado se a entrada já estiver ordenada (mas ainda gera frames)", () => {
    const frames = [...bubbleSort([1, 2, 3])];
    const lastFrame = frames[frames.length - 1];

    expect(lastFrame.array).toEqual([1, 2, 3]);
  });
});