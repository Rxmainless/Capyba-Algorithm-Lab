import { useEffect } from "react";
import { useExecutionStore } from "../../store/executionStore";

export function PlaybackControls() {
  const {
    isPlaying,
    play,
    pause,
    next,
    prev,
    reset,
    speed,
    setSpeed,
    currentIndex,
    frames,
  } = useExecutionStore();

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => useExecutionStore.getState().next(), speed);
    return () => clearInterval(id);
  }, [isPlaying, speed]);

  return (
    <div className="flex items-center gap-3 bg-panel rounded-lg p-3 font-mono text-sm">
      <button onClick={reset} className="text-text-secondary hover:text-white">
        ⏮
      </button>
      <button onClick={prev} className="text-text-secondary hover:text-white">
        ◀
      </button>
      <button
        onClick={isPlaying ? pause : play}
        className="text-accent-amber hover:text-white text-lg"
      >
        {isPlaying ? "⏸" : "▶"}
        <button
          onClick={useExecutionStore.getState().toggleMute}
          className="text-text-secondary hover:text-white"
        >
          {useExecutionStore((s) => s.muted) ? "🔇" : "🔊"}
        </button>
      </button>
      <button onClick={next} className="text-text-secondary hover:text-white">
        ▶|
      </button>
      <span className="text-text-secondary ml-2">
        {currentIndex + 1} / {frames.length}
      </span>
      <input
        type="range"
        min={50}
        max={1000}
        step={50}
        value={1050 - speed}
        onChange={(e) => setSpeed(1050 - Number(e.target.value))}
        className="ml-auto w-32"
      />
    </div>
  );
}
