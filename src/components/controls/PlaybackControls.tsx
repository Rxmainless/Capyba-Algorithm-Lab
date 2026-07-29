import { useEffect } from "react";
import { useExecutionStore } from "../../store/executionStore";

const SPEED_OPTIONS = [
  { label: "0.5x", value: 800 },
  { label: "1x", value: 400 },
  { label: "1.5x", value: 266 },
  { label: "2x", value: 200 },
  { label: "4x", value: 100 },
] as const;

interface PlaybackControlsProps {
  onPlay: () => void;
}

export function PlaybackControls({ onPlay }: PlaybackControlsProps) {
  const { isPlaying, pause, next, prev, reset, speed, setSpeed, currentIndex, frames, muted, toggleMute } =
    useExecutionStore();

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => useExecutionStore.getState().next(), speed);
    return () => clearInterval(id);
  }, [isPlaying, speed]);

  return (
    <div className="flex items-center gap-3 bg-panel rounded-lg p-3 font-mono text-sm">
      <button onClick={reset} className="text-text-secondary hover:text-white">⏮</button>
      <button onClick={prev} className="text-text-secondary hover:text-white">◀</button>
      <button onClick={isPlaying ? pause : onPlay} className="text-accent-amber hover:text-white text-lg">
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button onClick={next} className="text-text-secondary hover:text-white">▶|</button>
      <button onClick={toggleMute} className="text-text-secondary hover:text-white">
        {muted ? "🔇" : "🔊"}
      </button>
      <span className="text-text-secondary ml-2">{currentIndex + 1} / {frames.length}</span>

      <select
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className="ml-auto bg-bg text-accent-cyan rounded px-2 py-1 border border-text-secondary/30"
      >
        {SPEED_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}