import type { FrameAction } from "./types";

let ctx: AudioContext | null = null;

function getContext() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export const soundMap: Record<FrameAction, { freq: number; duration: number; type: OscillatorType }> = {
  compare: { freq: 440, duration: 0.05, type: "sine" },
  swap: { freq: 660, duration: 0.08, type: "triangle" },
  call: { freq: 220, duration: 0.06, type: "square" },
  return: { freq: 330, duration: 0.06, type: "square" },
  idle: { freq: 880, duration: 0.15, type: "sine" },
  probe: { freq: 550, duration: 0.06, type: "sine" },
  found: { freq: 990, duration: 0.2, type: "triangle" },
};

export function playFrameSound(action: FrameAction, muted: boolean) {
  if (muted) return;
  const audioCtx = getContext();
  const { freq, duration, type } = soundMap[action];

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}