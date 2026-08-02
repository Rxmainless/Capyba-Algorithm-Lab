import type { Frame } from "./types";

const CANVAS_W = 1080;
const CANVAS_H = 1920;

const COLORS = {
  bg: "#0B0E14",
  panel: "#131720",
  amber: "#FFB454",
  cyan: "#56D4DD",
  success: "#7FD88F",
  textSecondary: "#6B7280",
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function createRecordingCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  return canvas;
}

function barColor(frame: Frame, index: number): string {
  const isActive = frame.highlightedIndices.includes(index);
  const isEliminated = frame.eliminatedIndices?.includes(index) ?? false;
  if (isEliminated) return COLORS.textSecondary;
  if (isActive) {
    if (frame.action === "swap" || frame.action === "found") return COLORS.success;
    if (frame.action === "probe") return COLORS.cyan;
    return COLORS.amber;
  }
  return COLORS.cyan;
}

function drawHeader(ctx: CanvasRenderingContext2D, algorithmName: string) {
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.amber;
  ctx.font = "bold 56px monospace";
  ctx.fillText(algorithmName, CANVAS_W / 2, 140);
  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = "28px monospace";
  ctx.fillText("Lumen — Algorithm Lab", CANVAS_W / 2, 190);
}

function drawTargetBadge(ctx: CanvasRenderingContext2D, targetLabel: string) {
  ctx.fillStyle = COLORS.panel;
  ctx.fillRect(CANVAS_W / 2 - 180, 215, 360, 60);
  ctx.fillStyle = COLORS.cyan;
  ctx.font = "bold 28px monospace";
  ctx.textAlign = "center";
  ctx.fillText(targetLabel, CANVAS_W / 2, 255);
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  values: number[],
  colors: string[],
  glowIndices: number[],
  eliminatedIndices: number[] = []
) {
  const max = Math.max(...values, 1);
  const barAreaTop = 320;
  const barAreaHeight = 900;
  const gap = 12;
  const barWidth = (CANVAS_W - 120 - gap * (values.length - 1)) / values.length;
  const startX = 60;

  values.forEach((value, index) => {
    const barHeight = (value / max) * barAreaHeight;
    const x = startX + index * (barWidth + gap);
    const y = barAreaTop + barAreaHeight - barHeight;

    ctx.globalAlpha = eliminatedIndices.includes(index) ? 0.25 : 1;

    if (glowIndices.includes(index)) {
      ctx.shadowColor = colors[index];
      ctx.shadowBlur = 30;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = colors[index];
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.shadowBlur = 0;

    ctx.fillStyle = COLORS.bg;
    ctx.font = "bold 22px monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(Math.round(value)), x + barWidth / 2, y + 30);
    ctx.globalAlpha = 1;
  });
}

function drawNarrativeBox(ctx: CanvasRenderingContext2D, text: string) {
  ctx.fillStyle = COLORS.panel;
  ctx.fillRect(60, 1300, CANVAS_W - 120, 200);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "32px sans-serif";
  ctx.textAlign = "left";
  const lines = wrapText(ctx, text, CANVAS_W - 200);
  lines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, 100, 1360 + i * 42);
  });
}

function drawMetrics(ctx: CanvasRenderingContext2D, frame: Frame, pulse: number) {
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.cyan;
  ctx.save();
  ctx.translate(CANVAS_W / 2, 1560);
  ctx.scale(pulse, pulse);
  ctx.font = "bold 30px monospace";
  ctx.fillText(`${frame.metrics.comparisons} comparações · ${frame.metrics.swaps} trocas`, 0, 0);
  ctx.restore();

  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = "24px monospace";
  ctx.fillText(frame.metrics.estimatedComplexity, CANVAS_W / 2, 1600);
}

function drawHandle(ctx: CanvasRenderingContext2D, tiktokHandle: string, scale = 1) {
  ctx.save();
  ctx.translate(CANVAS_W / 2, 1830);
  ctx.scale(scale, scale);
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.amber;
  ctx.font = "bold 34px monospace";
  ctx.fillText(tiktokHandle, 0, 0);
  ctx.restore();
}

export function drawIntro(
  canvas: HTMLCanvasElement,
  algorithmName: string,
  complexity: string,
  progress: number,
  targetLabel?: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const scale = 0.85 + easeInOutCubic(Math.min(1, progress * 3)) * 0.15;
  ctx.textAlign = "center";
  ctx.save();
  ctx.translate(CANVAS_W / 2, 860);
  ctx.scale(scale, scale);
  ctx.fillStyle = COLORS.amber;
  ctx.font = "bold 84px monospace";
  ctx.fillText(algorithmName, 0, 0);
  ctx.restore();

  ctx.fillStyle = COLORS.cyan;
  ctx.font = "bold 42px monospace";
  ctx.fillText(complexity, CANVAS_W / 2, 960);

  if (targetLabel) {
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = "bold 32px monospace";
    ctx.fillText(targetLabel, CANVAS_W / 2, 1010);
  }

  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = "30px monospace";
  ctx.fillText("Lumen — Algorithm Lab", CANVAS_W / 2, 1070);
}

export function drawInterpolatedFrame(
  canvas: HTMLCanvasElement,
  frameA: Frame,
  frameB: Frame,
  t: number,
  algorithmName: string,
  tiktokHandle: string,
  targetLabel?: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawHeader(ctx, algorithmName);
  if (targetLabel) drawTargetBadge(ctx, targetLabel);

  const values = frameA.array.map((v, i) => v + (frameB.array[i] - v) * t);
  const colors = frameA.array.map((_, i) => lerpColor(barColor(frameA, i), barColor(frameB, i), t));
  const activeFrame = t > 0.5 ? frameB : frameA;
  const eliminated = activeFrame.eliminatedIndices ?? [];
  drawBars(ctx, values, colors, activeFrame.highlightedIndices, eliminated);

  drawNarrativeBox(ctx, activeFrame.narrative);
  const pulse = 1 + Math.sin(t * Math.PI) * 0.04;
  drawMetrics(ctx, activeFrame, pulse);
  drawHandle(ctx, tiktokHandle);
}

export type OutroMode = "sorted" | "found" | "not-found";

export function drawOutro(
  canvas: HTMLCanvasElement,
  finalFrame: Frame,
  algorithmName: string,
  tiktokHandle: string,
  progress: number,
  mode: OutroMode
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawHeader(ctx, algorithmName);

  let colors: string[];
  let eliminated: number[] = [];

  if (mode === "sorted") {
    const sweepCount = Math.floor(finalFrame.array.length * Math.min(1, progress * 1.4));
    colors = finalFrame.array.map((_, i) => (i < sweepCount ? COLORS.success : COLORS.cyan));
  } else if (mode === "found") {
    colors = finalFrame.array.map((_, i) =>
      finalFrame.highlightedIndices.includes(i) ? COLORS.success : COLORS.textSecondary
    );
    eliminated = finalFrame.array
      .map((_, i) => i)
      .filter((i) => !finalFrame.highlightedIndices.includes(i));
  } else {
    colors = finalFrame.array.map(() => COLORS.textSecondary);
    eliminated = finalFrame.array.map((_, i) => i);
  }

  drawBars(ctx, finalFrame.array, colors, mode === "found" ? finalFrame.highlightedIndices : [], eliminated);

  if (progress > 0.5) {
    const revealT = easeInOutCubic(Math.min(1, (progress - 0.5) * 2));
    const label = mode === "sorted" ? "✓ ORDENADO" : mode === "found" ? "✓ ENCONTRADO" : "✗ NÃO ENCONTRADO";
    const labelColor = mode === "not-found" ? COLORS.amber : COLORS.success;
    ctx.save();
    ctx.globalAlpha = revealT;
    ctx.textAlign = "center";
    ctx.fillStyle = labelColor;
    ctx.font = "bold 64px monospace";
    ctx.fillText(label, CANVAS_W / 2, 1400);
    ctx.restore();
  }

  drawHandle(ctx, tiktokHandle, progress > 0.5 ? 1 + (progress - 0.5) * 0.3 : 1);
}