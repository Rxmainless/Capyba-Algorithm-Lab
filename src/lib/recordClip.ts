import { fetchFile } from "@ffmpeg/util";
import type { AlgorithmDefinition } from "../engine/algorithms/registry";
import type { Frame } from "../engine/types";
import { soundMap } from "../engine/audio";
import {
  createRecordingCanvas,
  drawIntro,
  drawInterpolatedFrame,
  drawOutro,
  easeOutCubic,
  ensureFontsLoaded,
  type OutroMode,
} from "../engine/videoRenderer";
import { getRecommendedDuration, getRecordingArraySize } from "./videoDurations";
import { getFFmpeg } from "./ffmpegInstance";

const INTRO_MS = 1200;
const OUTRO_MS = 1800;

function randomArray(size: number) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

function pickTarget(array: number[]): number {
  const shouldExist = Math.random() > 0.15;
  return shouldExist ? array[Math.floor(Math.random() * array.length)] : Math.floor(Math.random() * 90) + 10;
}

function getSupportedMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9",
    "video/webm",
    "video/mp4",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  throw new Error("Nenhum formato de gravação suportado neste navegador.");
}

function scheduleFrameSounds(
  audioCtx: AudioContext,
  destination: MediaStreamAudioDestinationNode,
  frames: Frame[],
  msPerFrame: number,
  offsetMs: number
) {
  frames.forEach((frame, i) => {
    const { freq, duration, type } = soundMap[frame.action];
    const startTime = audioCtx.currentTime + (offsetMs + i * msPerFrame) / 1000;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

function scheduleOutroChime(
  audioCtx: AudioContext,
  destination: MediaStreamAudioDestinationNode,
  arrayLength: number,
  outroOffsetMs: number,
  mode: OutroMode
) {
  const playChord = (freqs: number[], atMs: number, gainValue: number) => {
    const startTime = audioCtx.currentTime + atMs / 1000;
    freqs.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(gainValue, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  };

  if (mode === "sorted") {
    const sweepWindowMs = OUTRO_MS * 0.6;
    for (let i = 0; i < arrayLength; i++) {
      const revealTime = (i / Math.max(1, arrayLength - 1)) * sweepWindowMs;
      playChord([440 * Math.pow(2, i / 12)], outroOffsetMs + revealTime, 0.07);
    }
    playChord([523.25, 659.25, 783.99], outroOffsetMs + OUTRO_MS * 0.55, 0.09);
  } else if (mode === "found") {
    playChord([659.25, 987.77], outroOffsetMs + OUTRO_MS * 0.5, 0.1);
  } else {
    playChord([220], outroOffsetMs + OUTRO_MS * 0.5, 0.08);
  }
}

interface RecordClipOptions {
  algorithm: AlgorithmDefinition;
  tiktokHandle: string;
  onProgress: (message: string) => void;
}

export async function recordClip({ algorithm, tiktokHandle, onProgress }: RecordClipOptions): Promise<Blob> {
  onProgress("Gerando execução do algoritmo...");
  const arraySize = getRecordingArraySize(algorithm.id);
  const durationSeconds = getRecommendedDuration(algorithm.id);
  const input = randomArray(arraySize);
  const target = algorithm.requiresTarget ? pickTarget(input) : 0;
  const frames = [...algorithm.run(input, target)];

  const totalMs = durationSeconds * 1000;
  const mainMs = Math.max(3000, totalMs - INTRO_MS - OUTRO_MS);
  const msPerFrame = mainMs / Math.max(1, frames.length - 1);
  const targetLabel = algorithm.requiresTarget ? `buscando por ${target}` : undefined;

  const lastFrame = frames[frames.length - 1];
  const outroMode: OutroMode = !algorithm.requiresTarget
    ? "sorted"
    : lastFrame.action === "found"
      ? "found"
      : "not-found";

  const canvas = createRecordingCanvas();
  await ensureFontsLoaded();

  const videoStream = canvas.captureStream(30);

  const audioCtx = new AudioContext();
  await audioCtx.resume();
  const audioDestination = audioCtx.createMediaStreamDestination();
  scheduleFrameSounds(audioCtx, audioDestination, frames, msPerFrame, INTRO_MS);
  scheduleOutroChime(audioCtx, audioDestination, lastFrame.array.length, INTRO_MS + mainMs, outroMode);

  const combinedStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...audioDestination.stream.getAudioTracks(),
  ]);

  const mimeType = getSupportedMimeType();
  const fileExt = mimeType.includes("mp4") ? "mp4" : "webm";
  const recorder = new MediaRecorder(combinedStream, { mimeType });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const recordingDone = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType.split(";")[0] }));
  });

  onProgress(`Gravando ${algorithm.name} (${durationSeconds}s)...`);
  recorder.start();

  const complexity = frames[0]?.metrics.estimatedComplexity ?? "";
  await new Promise<void>((resolve) => {
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;

      if (elapsed < INTRO_MS) {
        drawIntro(canvas, algorithm.name, complexity, elapsed / INTRO_MS, targetLabel);
      } else if (elapsed < INTRO_MS + mainMs) {
        const localElapsed = elapsed - INTRO_MS;
        const idx = Math.min(frames.length - 2, Math.floor(localElapsed / msPerFrame));
        const t = easeOutCubic(Math.min(1, (localElapsed % msPerFrame) / msPerFrame));
        drawInterpolatedFrame(
          canvas,
          frames[idx],
          frames[idx + 1] ?? frames[idx],
          t,
          algorithm.name,
          tiktokHandle,
          targetLabel
        );
      } else if (elapsed < INTRO_MS + mainMs + OUTRO_MS) {
        const outroT = (elapsed - INTRO_MS - mainMs) / OUTRO_MS;
        drawOutro(canvas, lastFrame, algorithm.name, tiktokHandle, outroT, outroMode);
      } else {
        resolve();
        return;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  recorder.stop();
  const recordedBlob = await recordingDone;
  audioCtx.close();

  onProgress("Carregando conversor de vídeo...");
  const ffmpeg = await getFFmpeg();

  onProgress("Convertendo para MP4...");
  const inputName = `input.${fileExt}`;
  await ffmpeg.writeFile(inputName, await fetchFile(recordedBlob));
  await ffmpeg.exec([
    "-i", inputName,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "128k",
    "output.mp4",
  ]);
  const data = await ffmpeg.readFile("output.mp4");

  onProgress("Concluído!");
  return new Blob([data as unknown as ArrayBuffer], { type: "video/mp4" });
}