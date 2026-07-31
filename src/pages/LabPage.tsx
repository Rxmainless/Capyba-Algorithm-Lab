import { useEffect, useRef, useState } from "react";
import { useExecutionStore } from "../store/executionStore";
import { useProgressStore } from "../store/progressStore";
import { useFrameAudio } from "../hooks/useFrameAudio";
import { getAlgorithmById } from "../engine/algorithms/registry";
import { AlgorithmSelector } from "../components/controls/AlgorithmSelector";
import { VisualizationPanel } from "../components/panels/VisualizationPanel";
import { NarrativePanel } from "../components/panels/NarrativePanel";
import { MetricsPanel } from "../components/panels/MetricsPanel";
import { CallStackPanel } from "../components/panels/CallStackPanel";
import { CodePanel } from "../components/panels/CodePanel";
import { PlaybackControls } from "../components/controls/PlaybackControls";
import { TrailPage } from "../components/trail/TrailPage";

function randomArray(size = 12) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

function pickTarget(array: number[]) {
  const shouldExist = Math.random() > 0.3;
  return shouldExist ? array[Math.floor(Math.random() * array.length)] : Math.floor(Math.random() * 90) + 10;
}

type View = "trail" | "execution";

export function LabPage() {
  const loadFrames = useExecutionStore((s) => s.loadFrames);
  const markCompleted = useProgressStore((s) => s.markCompleted);
  useFrameAudio();

  const [view, setView] = useState<View>("trail");
  const [algorithmId, setAlgorithmId] = useState("bubble-sort");
  const [inputArray, setInputArray] = useState(randomArray());
  const [target, setTarget] = useState(() => pickTarget(inputArray));
  const autoPlayOnLoad = useRef(false);

  useEffect(() => {
    const algorithm = getAlgorithmById(algorithmId);
    loadFrames([...algorithm.run(inputArray, target)]);

    if (autoPlayOnLoad.current) {
      useExecutionStore.getState().play();
      autoPlayOnLoad.current = false;
    }
  }, [algorithmId, inputArray, target, loadFrames]);

  const currentIndex = useExecutionStore((s) => s.currentIndex);
  const frames = useExecutionStore((s) => s.frames);

  useEffect(() => {
    if (frames.length > 0 && currentIndex === frames.length - 1) {
      markCompleted(algorithmId);
    }
  }, [currentIndex, frames.length, algorithmId, markCompleted]);

  const handleNewArray = () => {
    const array = randomArray();
    setInputArray(array);
    setTarget(pickTarget(array));
  };

  const handleSelectFromTrail = (id: string) => {
    setAlgorithmId(id);
    handleNewArray();
    setView("execution");
  };

  const handlePlay = () => {
    const { currentIndex, frames } = useExecutionStore.getState();
    const isFinished = frames.length > 0 && currentIndex === frames.length - 1;

    if (isFinished) {
      autoPlayOnLoad.current = true;
      handleNewArray();
    } else {
      useExecutionStore.getState().play();
    }
  };

  const currentAlgorithm = getAlgorithmById(algorithmId);

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col p-4 md:p-6 gap-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          {view === "execution" && (
            <button
              onClick={() => setView("trail")}
              className="font-mono text-xs text-text-secondary hover:text-white bg-panel rounded px-2 py-1"
            >
              ← Trilha
            </button>
          )}
          <h1 className="font-mono text-lg text-accent-amber">Lumen</h1>
          {view === "execution" && currentAlgorithm.requiresTarget && (
            <span className="font-mono text-xs text-text-secondary bg-panel rounded px-2 py-1">
              buscando por <span className="text-accent-cyan">{target}</span>
            </span>
          )}
        </div>
        {view === "execution" && (
          <AlgorithmSelector selectedId={algorithmId} onSelect={setAlgorithmId} onNewArray={handleNewArray} />
        )}
      </div>

      {view === "trail" ? (
        <TrailPage onSelect={handleSelectFromTrail} />
      ) : (
        <>
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
        </>
      )}

      <footer className="text-center text-xs font-mono text-text-secondary pt-2">
        Criado por <a href="https://github.com/Rxmainless" target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:text-white">Rxmainless</a>
      </footer>
    </div>
  );
}