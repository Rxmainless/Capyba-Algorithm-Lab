import { useEffect, useState } from "react";
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

  useEffect(() => {
    const algorithm = getAlgorithmById(algorithmId);
    loadFrames([...algorithm.run(inputArray)]);
  }, [algorithmId, inputArray, loadFrames]);

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col p-4 md:p-6 gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="font-mono text-lg text-accent-amber">Capyba-Algorithm-Lab</h1>
        <AlgorithmSelector
          selectedId={algorithmId}
          onSelect={setAlgorithmId}
          onNewArray={() => setInputArray(randomArray())}
        />
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_340px] gap-4">
        <VisualizationPanel />
        <div className="flex flex-col gap-4">
          <NarrativePanel />
          <MetricsPanel />
          <CallStackPanel />
          <CodePanel algorithmId={algorithmId} />
        </div>
      </div>
      <PlaybackControls />
    </div>
  );
}