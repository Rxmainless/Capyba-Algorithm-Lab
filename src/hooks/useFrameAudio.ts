import { useEffect, useRef } from "react";
import { useExecutionStore } from "../store/executionStore";
import { playFrameSound } from "../engine/audio";

export function useFrameAudio() {
  const currentIndex = useExecutionStore((s) => s.currentIndex);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const { frames, muted } = useExecutionStore.getState();
    const frame = frames[currentIndex];
    if (frame) playFrameSound(frame.action, muted);
  }, [currentIndex]);
}