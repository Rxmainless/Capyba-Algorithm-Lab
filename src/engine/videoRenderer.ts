import type { Frame } from "./types";

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const FONT = "'JetBrains Mono', monospace";
const SAFE_LEFT = 100;
const SAFE_RIGHT = 100;
const SAFE_BOTTOM = 220;

const COLORS = {
  bg: "#0B0E14",
  bgGlow: "#131A26",
  panel: "#131720",
  amber: "#FFB454",
  cyan: "#56D4DD",
  success: "#7FD88F",
  textSecondary: "#6B7280",
};

let fontsReady: Promise<void> | null = null;

export function ensureFontsLoaded(): Promise<void> {
  if (!fontsReady) {
    fontsReady = Promise.all([
      document.fonts.load(`700 16px ${FONT}`),
      document.fonts.load(`400 16px ${FONT}`),
    ]).then(() => document.fonts.ready).then(() => undefined);
  }
  return fontsReady;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return `rgb(${Math.round(ar + (br - ar) * t)}, ${Math.round(ag + (bg - ag) * t)}, ${Math.round(ab + (bb - ab) * t)})`;
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

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radii: number | number[]) {
  if (h <= 0 || w <= 0) return;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radii);
  ctx.fill();
}

export function createRecordingCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  return canvas;
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H * 0.35, 100, CANVAS_W / 2, CANVAS_H * 0.35, CANVAS_H * 0.8);
  gradient.addColorStop(0, COLORS.bgGlow);
  gradient.addColorStop(1, COLORS.bg);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
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
  ctx.font = `bold 56px ${FONT}`;
  ctx.fillText(algorithmName, CANVAS_W / 2, 140);
  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = `28px ${FONT}`;
  ctx.fillText("Lumen — Algorithm Lab", CANVAS_W / 2, 190);
}

function drawTargetBadge(ctx: CanvasRenderingContext2D, targetLabel: string) {
  ctx.fillStyle = COLORS.panel;
  roundedRect(ctx, CANVAS_W / 2 - 180, 215, 360, 60, 16);
  ctx.fillStyle = COLORS.cyan;
  ctx.font = `bold 28px ${FONT}`;
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
  const barAreaHeight = 860;
  const gap = 12;
  const usableWidth = CANVAS_W - SAFE_LEFT - SAFE_RIGHT;
  const barWidth = (usableWidth - gap * (values.length - 1)) / values.length;

  values.forEach((value, index) => {
    const barHeight = (value / max) * barAreaHeight;
    const x = SAFE_LEFT + index * (barWidth + gap);
    const y = barAreaTop + barAreaHeight - barHeight;

    ctx.globalAlpha = eliminatedIndices.includes(index) ? 0.25 : 1;
    if (glowIndices.includes(index)) {
      ctx.shadowColor = colors[index];
      ctx.shadowBlur = 30;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = colors[index];
    roundedRect(ctx, x, y, barWidth, barHeight, [6, 6, 0, 0]);
    ctx.shadowBlur = 0;

    ctx.fillStyle = COLORS.bg;
    ctx.font = `bold 22px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText(String(Math.round(value)), x + barWidth / 2, y + 30);
    ctx.globalAlpha = 1;
  });
}

function drawNarrativeBox(ctx: CanvasRenderingContext2D, text: string) {
  ctx.fillStyle = COLORS.panel;
  roundedRect(ctx, SAFE_LEFT, 1260, CANVAS_W - SAFE_LEFT - SAFE_RIGHT, 190, 16);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "32px sans-serif";
  ctx.textAlign = "left";
  const lines = wrapText(ctx, text, CANVAS_W - SAFE_LEFT - SAFE_RIGHT - 40);
  lines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, SAFE_LEFT + 30, 1315 + i * 42);
  });
}

function drawMetrics(ctx: CanvasRenderingContext2D, frame: Frame, pulse: number) {
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.cyan;
  ctx.save();
  ctx.translate(CANVAS_W / 2, 1500);
  ctx.scale(pulse, pulse);
  ctx.font = `bold 30px ${FONT}`;
  ctx.fillText(`${frame.metrics.comparisons} comparações · ${frame.metrics.swaps} trocas`, 0, 0);
  ctx.restore();

  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = `24px ${FONT}`;
  ctx.fillText(frame.metrics.estimatedComplexity, CANVAS_W / 2, 1540);
}

function drawHandle(ctx: CanvasRenderingContext2D, tiktokHandle: string, scale = 1) {
  ctx.save();
  ctx.translate(CANVAS_W / 2, CANVAS_H - SAFE_BOTTOM);
  ctx.scale(scale, scale);
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.amber;
  ctx.font = `bold 34px ${FONT}`;
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
  drawBackground(ctx);

  const scale = 0.85 + easeInOutCubic(Math.min(1, progress * 3)) * 0.15;
  ctx.textAlign = "center";
  ctx.save();
  ctx.translate(CANVAS_W / 2, 860);
  ctx.scale(scale, scale);
  ctx.fillStyle = COLORS.amber;
  ctx.font = `bold 84px ${FONT}`;
  ctx.fillText(algorithmName, 0, 0);
  ctx.restore();

  ctx.fillStyle = COLORS.cyan;
  ctx.font = `bold 42px ${FONT}`;
  ctx.fillText(complexity, CANVAS_W / 2, 960);

  if (targetLabel) {
    ctx.fillStyle = COLORS.textSecondary;
    ctx.font = `bold 32px ${FONT}`;
    ctx.fillText(targetLabel, CANVAS_W / 2, 1010);
  }

  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = `30px ${FONT}`;
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
  drawBackground(ctx);
  drawHeader(ctx, algorithmName);
  if (targetLabel) drawTargetBadge(ctx, targetLabel);

  const values = frameA.array.map((v, i) => v + (frameB.array[i] - v) * t);
  const colors = frameA.array.map((_, i) => lerpColor(barColor(frameA, i), barColor(frameB, i), t));
  const activeFrame = t > 0.5 ? frameB : frameA;
  drawBars(ctx, values, colors, activeFrame.highlightedIndices, activeFrame.eliminatedIndices ?? []);

  drawNarrativeBox(ctx, activeFrame.narrative);
  drawMetrics(ctx, activeFrame, 1 + Math.sin(t * Math.PI) * 0.04);
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
  drawBackground(ctx);
  drawHeader(ctx, algorithmName);

  let colors: string[];
  let eliminated: number[] = [];

  if (mode === "sorted") {
    const sweepCount = Math.floor(finalFrame.array.length * Math.min(1, progress * 1.4));
    colors = finalFrame.array.map((_, i) => (i < sweepCount ? COLORS.success : COLORS.cyan));
  } else if (mode === "found") {
    colors = finalFrame.array.map((_, i) => (finalFrame.highlightedIndices.includes(i) ? COLORS.success : COLORS.textSecondary));
    eliminated = finalFrame.array.map((_, i) => i).filter((i) => !finalFrame.highlightedIndices.includes(i));
  } else {
    colors = finalFrame.array.map(() => COLORS.textSecondary);
    eliminated = finalFrame.array.map((_, i) => i);
  }

  drawBars(ctx, finalFrame.array, colors, mode === "found" ? finalFrame.highlightedIndices : [], eliminated);

  if (progress > 0.5) {
    const revealT = easeInOutCubic(Math.min(1, (progress - 0.5) * 2));
    const label = mode === "sorted" ? "✓ ORDENADO" : mode === "found" ? "✓ ENCONTRADO" : "✗ NÃO ENCONTRADO";
    ctx.save();
    ctx.globalAlpha = revealT;
    ctx.textAlign = "center";
    ctx.fillStyle = mode === "not-found" ? COLORS.amber : COLORS.success;
    ctx.font = `bold 64px ${FONT}`;
    ctx.fillText(label, CANVAS_W / 2, 1400);
    ctx.restore();
  }

  drawHandle(ctx, tiktokHandle, progress > 0.5 ? 1 + (progress - 0.5) * 0.3 : 1);
}