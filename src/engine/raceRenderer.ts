const CANVAS_W = 1080;
const CANVAS_H = 1920;
const FONT = "'JetBrains Mono', monospace";
const SAFE_LEFT = 80;
const SAFE_RIGHT = 80;

const COLORS = {
  bg: "#0B0E14",
  bgGlow: "#131A26",
  panel: "#131720",
  amber: "#FFB454",
  cyan: "#56D4DD",
  success: "#7FD88F",
  textSecondary: "#6B7280",
};

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number | number[]) {
  if (w <= 0 || h <= 0) return;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H * 0.3, 100, CANVAS_W / 2, CANVAS_H * 0.3, CANVAS_H * 0.9);
  gradient.addColorStop(0, COLORS.bgGlow);
  gradient.addColorStop(1, COLORS.bg);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

export function createRaceCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  return canvas;
}

export function drawRaceIntro(canvas: HTMLCanvasElement, progress: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  drawBackground(ctx);
  const scale = 0.85 + Math.min(1, progress * 3) * 0.15;
  ctx.textAlign = "center";
  ctx.save();
  ctx.translate(CANVAS_W / 2, 820);
  ctx.scale(scale, scale);
  ctx.fillStyle = COLORS.amber;
  ctx.font = `bold 62px ${FONT}`;
  ctx.fillText("Qual ordena", 0, -40);
  ctx.fillText("mais rápido?", 0, 40);
  ctx.restore();
  ctx.fillStyle = COLORS.textSecondary;
  ctx.font = `28px ${FONT}`;
  ctx.fillText("Lumen — Algorithm Lab", CANVAS_W / 2, 950);
}

export interface RaceRowData {
  name: string;
  array: number[];
  highlighted: number[];
  done: boolean;
  comparisons: number;
}

export function drawRaceFrame(canvas: HTMLCanvasElement, entries: RaceRowData[], tiktokHandle: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  drawBackground(ctx);

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.amber;
  ctx.font = `bold 40px ${FONT}`;
  ctx.fillText("Corrida de Ordenação", CANVAS_W / 2, 90);

  const rowTop = 140;
  const rowHeight = 248;
  const rowGap = 14;
  const chartHeight = 130;
  const usableWidth = CANVAS_W - SAFE_LEFT - SAFE_RIGHT;

  entries.forEach((entry, rowIndex) => {
    const rowY = rowTop + rowIndex * (rowHeight + rowGap);

    ctx.fillStyle = COLORS.panel;
    roundedRect(ctx, SAFE_LEFT, rowY, usableWidth, rowHeight, 14);

    ctx.textAlign = "left";
    ctx.fillStyle = entry.done ? COLORS.success : "#FFFFFF";
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillText(entry.done ? `✓ ${entry.name}` : entry.name, SAFE_LEFT + 20, rowY + 32);

    ctx.textAlign = "right";
    ctx.fillStyle = COLORS.cyan;
    ctx.font = `18px ${FONT}`;
    ctx.fillText(`${entry.comparisons} comp.`, SAFE_LEFT + usableWidth - 20, rowY + 32);

    const max = Math.max(...entry.array, 1);
    const gap = 4;
    const barW = (usableWidth - 40 - gap * (entry.array.length - 1)) / entry.array.length;
    entry.array.forEach((value, i) => {
      const h = (value / max) * chartHeight;
      const x = SAFE_LEFT + 20 + i * (barW + gap);
      const y = rowY + rowHeight - 20 - h;
      const isActive = entry.highlighted.includes(i);
      ctx.fillStyle = entry.done ? COLORS.success : isActive ? COLORS.amber : COLORS.cyan;
      roundedRect(ctx, x, y, barW, h, [2, 2, 0, 0]);
    });
  });

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.amber;
  ctx.font = `bold 30px ${FONT}`;
  ctx.fillText(tiktokHandle, CANVAS_W / 2, CANVAS_H - 70);
}

export function drawRaceOutro(canvas: HTMLCanvasElement, winnerName: string, progress: number, tiktokHandle: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  drawBackground(ctx);
  const revealT = Math.min(1, progress * 1.3);
  ctx.save();
  ctx.globalAlpha = revealT;
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.success;
  ctx.font = `bold 38px ${FONT}`;
  ctx.fillText("🏆 MAIS RÁPIDO", CANVAS_W / 2, 860);
  ctx.fillStyle = COLORS.amber;
  ctx.font = `bold 68px ${FONT}`;
  ctx.fillText(winnerName, CANVAS_W / 2, 950);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.amber;
  ctx.font = `bold 30px ${FONT}`;
  ctx.fillText(tiktokHandle, CANVAS_W / 2, CANVAS_H - 70);
}