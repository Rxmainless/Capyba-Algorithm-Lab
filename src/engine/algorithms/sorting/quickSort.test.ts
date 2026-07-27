import { describe, it, expect } from "vitest";
import { quickSort } from "./quickSort";

describe("quickSort", () => {
  it("ordena um array desordenado corretamente", () => {
    const frames = [...quickSort([5, 2, 4, 1, 3])];
    const lastFrame = frames[frames.length - 1];
    expect(lastFrame.array).toEqual([1, 2, 3, 4, 5]);
    expect(lastFrame.action).toBe("idle");
  });

  it("nunca muta o array original recebido", () => {
    const original = [5, 2, 4, 1, 3];
    const consumed = [...quickSort(original)];
    expect(consumed.length).toBeGreaterThan(0);
    expect(original).toEqual([5, 2, 4, 1, 3]);
  });

  it("gera frames de call e return, provando a recursão", () => {
    const frames = [...quickSort([5, 2, 4, 1, 3])];
    expect(frames.some((f) => f.action === "call")).toBe(true);
    expect(frames.some((f) => f.action === "return")).toBe(true);
  });

  it("a call stack cresce e depois volta a ficar vazia", () => {
    const frames = [...quickSort([5, 2, 4, 1, 3])];
    const maxDepth = Math.max(...frames.map((f) => f.callStack.length));
    const lastFrame = frames[frames.length - 1];
    expect(maxDepth).toBeGreaterThan(1);
    expect(lastFrame.callStack.length).toBe(0);
  });

  it("lida com array vazio e de 1 elemento sem quebrar", () => {
    expect([...quickSort([])].length).toBeGreaterThan(0);
    expect([...quickSort([42])].length).toBeGreaterThan(0);
  });
});