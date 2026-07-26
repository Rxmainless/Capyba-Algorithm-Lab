import { useEffect } from "react";
import { bubbleSort } from "./engine/algorithms/sorting/bubbleSort";
import { useExecutionStore } from "./store/executionStore";
import { useFrameAudio } from "./hooks/useFrameAudio";
import { VisualizationPanel } from "./components/panels/VisualizationPanel";
import { NarrativePanel } from "./components/panels/NarrativePanel";
import { MetricsPanel } from "./components/panels/MetricsPanel";
import { CallStackPanel } from "./components/panels/CallStackPanel";
import { PlaybackControls } from "./components/controls/PlaybackControls";

function randomArray(size = 12) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

export default function App() {
  const loadFrames = useExecutionStore((s) => s.loadFrames);
  useFrameAudio();

  useEffect(() => {
    loadFrames([...bubbleSort(randomArray())]);
  }, [loadFrames]);

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col p-6 gap-4">
      <h1 className="font-mono text-lg text-accent-amber">Capyba-Algorithm-Lab</h1>
      <div className="flex-1 grid grid-cols-[1fr_320px] gap-4">
        <VisualizationPanel />
        <div className="flex flex-col gap-4">
          <NarrativePanel />
          <MetricsPanel />
          <CallStackPanel />
        </div>
      </div>
      <PlaybackControls />
    </div>
  );
}