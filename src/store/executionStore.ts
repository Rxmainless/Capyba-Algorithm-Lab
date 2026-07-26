import { create } from "zustand";
import type { Frame } from "../engine/types";

interface ExecutionState {
  frames: Frame[];
  currentIndex: number;
  isPlaying: boolean;
  speed: number;
  muted: boolean;
  loadFrames: (frames: Frame[]) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  toggleMute: () => void;
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  frames: [],
  currentIndex: 0,
  isPlaying: false,
  speed: 400,
  muted: false,

  loadFrames: (frames) => set({ frames, currentIndex: 0, isPlaying: false }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  next: () => {
    const { currentIndex, frames } = get();
    if (currentIndex < frames.length - 1) set({ currentIndex: currentIndex + 1 });
    else set({ isPlaying: false });
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1 });
  },

  reset: () => set({ currentIndex: 0, isPlaying: false }),
  setSpeed: (speed) => set({ speed }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}));