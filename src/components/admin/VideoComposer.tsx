import { useState } from "react";
import { algorithms } from "../../engine/algorithms/registry";
import { recordClip } from "../../lib/recordClip";
import { recordRaceClip } from "../../lib/recordRaceClip";
import { getRecommendedDuration } from "../../lib/videoDurations";

const categories = [...new Set(algorithms.map((a) => a.category))];

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err instanceof DOMException) return `${err.name}: ${err.message}`;
  return "falha desconhecida";
}

export function VideoComposer() {
  const [algorithmId, setAlgorithmId] = useState(algorithms[0].id);
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("lumen-video");
  const [isRecording, setIsRecording] = useState(false);

  const handleRecordSingle = async () => {
    setIsRecording(true);
    setVideoUrl(null);
    const algorithm = algorithms.find((a) => a.id === algorithmId)!;

    try {
      const blob = await recordClip({
        algorithm,
        tiktokHandle: "@notfoundbyte",
        onProgress: setStatus,
      });
      setFileName(`lumen-${algorithmId}`);
      setVideoUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Falha ao gerar vídeo:", err);
      setStatus(`Erro: ${extractErrorMessage(err)}`);
    } finally {
      setIsRecording(false);
    }
  };

  const handleRecordRace = async () => {
    setIsRecording(true);
    setVideoUrl(null);

    try {
      const blob = await recordRaceClip({
        tiktokHandle: "@notfoundbyte",
        onProgress: setStatus,
      });
      setFileName("lumen-corrida-ordenacao");
      setVideoUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Falha ao gerar vídeo de corrida:", err);
      setStatus(`Erro: ${extractErrorMessage(err)}`);
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-panel rounded-lg p-4 max-w-md flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-xs text-text-secondary uppercase tracking-wide">
          Vídeo individual
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
          Duração: <span className="text-accent-cyan">{getRecommendedDuration(algorithmId)}s</span>
        </p>

        <button
          onClick={handleRecordSingle}
          disabled={isRecording}
          className="bg-accent-amber text-bg font-mono text-sm font-semibold rounded px-3 py-2 disabled:opacity-50"
        >
          {isRecording ? "Gravando..." : "Gerar Vídeo Individual"}
        </button>
      </div>

      <div className="border-t border-text-secondary/20 pt-4 flex flex-col gap-3">
        <h3 className="font-mono text-xs text-text-secondary uppercase tracking-wide">
          Vídeo de corrida (6 algoritmos)
        </h3>
        <p className="font-mono text-xs text-text-secondary">
          Duração: <span className="text-accent-cyan">~21s</span> · mostra todos ordenando o mesmo array ao mesmo tempo
        </p>
        <button
          onClick={handleRecordRace}
          disabled={isRecording}
          className="bg-accent-cyan text-bg font-mono text-sm font-semibold rounded px-3 py-2 disabled:opacity-50"
        >
          {isRecording ? "Gravando..." : "Gerar Vídeo de Corrida"}
        </button>
      </div>

      {status && <p className="font-mono text-xs text-text-secondary">{status}</p>}

      {videoUrl && (
        <a href={videoUrl} download={`${fileName}.mp4`} className="text-accent-cyan text-sm underline text-center">
          ⬇ Baixar MP4
        </a>
      )}
    </div>
  );
}