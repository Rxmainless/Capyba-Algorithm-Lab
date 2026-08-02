import { useState } from "react";
import { algorithms } from "../../engine/algorithms/registry";
import { recordClip } from "../../lib/recordClip";
import { getRecommendedDuration } from "../../lib/videoDurations";

const categories = [...new Set(algorithms.map((a) => a.category))];

export function VideoComposer() {
  const [algorithmId, setAlgorithmId] = useState(algorithms[0].id);
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleRecord = async () => {
    setIsRecording(true);
    setVideoUrl(null);
    const algorithm = algorithms.find((a) => a.id === algorithmId)!;

    try {
      const blob = await recordClip({
        algorithm,
        tiktokHandle: "@notfoundbyte",
        onProgress: setStatus,
      });
      setVideoUrl(URL.createObjectURL(blob));
    } catch (err) {
      const message =
        err instanceof Error ? err.message :
        err instanceof DOMException ? `${err.name}: ${err.message}` :
        "falha desconhecida";
      console.error("Falha ao gerar vídeo:", err);
      setStatus(`Erro: ${message}`);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-panel rounded-lg p-4 max-w-md flex flex-col gap-3">
      <h3 className="font-mono text-xs text-text-secondary uppercase tracking-wide">
        Compositor de Vídeo
      </h3>

      <select
        value={algorithmId}
        onChange={(e) => setAlgorithmId(e.target.value)}
        className="bg-bg text-white rounded px-3 py-1.5 border border-text-secondary/30 font-mono text-sm"
        disabled={isRecording}
      >
        {categories.map((category) => (
          <optgroup key={category} label={category}>
            {algorithms
              .filter((a) => a.category === category)
              .map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>

      <p className="font-mono text-xs text-text-secondary">
        Duração pré-definida: <span className="text-accent-cyan">{getRecommendedDuration(algorithmId)}s</span> (calibrada para este algoritmo)
      </p>

      <button
        onClick={handleRecord}
        disabled={isRecording}
        className="bg-accent-amber text-bg font-mono text-sm font-semibold rounded px-3 py-2 disabled:opacity-50"
      >
        {isRecording ? "Gravando..." : "Gerar Vídeo"}
      </button>

      {status && <p className="font-mono text-xs text-text-secondary">{status}</p>}

      {videoUrl && (
        <a href={videoUrl} download={`lumen-${algorithmId}.mp4`} className="text-accent-cyan text-sm underline text-center">
          ⬇ Baixar MP4
        </a>
      )}
    </div>
  );
}