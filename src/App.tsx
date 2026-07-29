import { useEffect, useRef, useState } from "react";
import { useExecutionStore } from "./store/executionStore";
import { useFrameAudio } from "./hooks/useFrameAudio";
import { getAlgorithmById } from "./engine/algorithms/registry";
import { AlgorithmSelector } from "./components/controls/AlgorithmSelector";
import { VisualizationPanel } from "./components/panels/VisualizationPanel";
import { NarrativePanel } from "./components/panels/NarrativePanel";
import { MetricsPanel } from "./components/panels/MetricsPanel";
import { CallStackPanel } from "./components/panels/CallStackPanel";
import { CodePanel } from "./components/panels/CodePanel";
import { PlaybackControls } from "./components/controls/PlaybackControls";

function randomArray(size = 12) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

export default function App() {
  const loadFrames = useExecutionStore((s) => s.loadFrames);
  useFrameAudio();

  const [algorithmId, setAlgorithmId] = useState("bubble-sort");
  const [inputArray, setInputArray] = useState(randomArray());
  const autoPlayOnLoad = useRef(false);

  useEffect(() => {
    const algorithm = getAlgorithmById(algorithmId);
    loadFrames([...algorithm.run(inputArray)]);

    if (autoPlayOnLoad.current) {
      useExecutionStore.getState().play();
      autoPlayOnLoad.current = false;
    }
  }, [algorithmId, inputArray, loadFrames]);

  const handlePlay = () => {
    const { currentIndex, frames } = useExecutionStore.getState();
    const isFinished = frames.length > 0 && currentIndex === frames.length - 1;

    if (isFinished) {
      autoPlayOnLoad.current = true;
      setInputArray(randomArray());
    } else {
      useExecutionStore.getState().play();
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col p-4 md:p-6 gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="font-mono text-lg text-accent-amber">Lumen</h1>
        <AlgorithmSelector
          selectedId={algorithmId}
          onSelect={setAlgorithmId}
          onNewArray={() => setInputArray(randomArray())}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-4">
        <VisualizationPanel />
        <div className="flex flex-col gap-4">
          <NarrativePanel />
          <MetricsPanel />
          <CallStackPanel />
        </div>
      </div>
      <CodePanel algorithmId={algorithmId} />
      <PlaybackControls onPlay={handlePlay} />
      <footer className="text-center text-xs font-mono text-text-secondary pt-2">
        Built by <a href="https://github.com/Rxmainless" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:text-white">Rxmainless</a>
      </footer>
    </div>
  );
}