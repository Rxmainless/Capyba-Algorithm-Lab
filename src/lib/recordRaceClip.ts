import { fetchFile } from "@ffmpeg/util";
import { getFFmpeg } from "./ffmpegInstance";
import { ensureFontsLoaded } from "../engine/videoRenderer";
import { createRaceCanvas, drawRaceIntro, drawRaceFrame, drawRaceOutro, type RaceRowData } from "../engine/raceRenderer";
import { algorithms } from "../engine/algorithms/registry";

const INTRO_MS = 1500;
const MAIN_MS = 18000;
const OUTRO_MS = 1500;
const RACE_IDS = ["bubble-sort", "selection-sort", "insertion-sort", "quick-sort", "merge-sort", "heap-sort"];

function randomArray(size = 10) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
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

interface RecordRaceOptions {
  tiktokHandle: string;
  onProgress: (message: string) => void;
}

export async function recordRaceClip({ tiktokHandle, onProgress }: RecordRaceOptions): Promise<Blob> {
  onProgress("Gerando as execuções...");
  const baseArray = randomArray(10);

  const runs = RACE_IDS.map((id) => {
    const algo = algorithms.find((a) => a.id === id)!;
    const frames = [...algo.run([...baseArray], 0)];
    return { name: algo.name, frames };
  });

  const maxSteps = Math.max(...runs.map((r) => r.frames.length));
  const finishTimes = runs.map((r) => (r.frames.length / maxSteps) * MAIN_MS);
  const winnerName = runs.reduce((best, r) => (r.frames.length < best.frames.length ? r : best)).name;

  const canvas = createRaceCanvas();
  await ensureFontsLoaded();
  const videoStream = canvas.captureStream(30);

  const audioCtx = new AudioContext();
  await audioCtx.resume();
  const audioDestination = audioCtx.createMediaStreamDestination();

  const playTone = (atMs: number, freqs: number[], gainValue: number) => {
    const startTime = audioCtx.currentTime + atMs / 1000;
    freqs.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(gainValue, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.connect(gain);
      gain.connect(audioDestination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  };

  finishTimes.forEach((ms, i) => playTone(INTRO_MS + ms, [440 + i * 60], 0.08));
  playTone(INTRO_MS + MAIN_MS + 200, [523.25, 659.25, 783.99], 0.1);

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

  onProgress("Gravando a corrida...");
  recorder.start();

  await new Promise<void>((resolve) => {
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;

      if (elapsed < INTRO_MS) {
        drawRaceIntro(canvas, elapsed / INTRO_MS);
      } else if (elapsed < INTRO_MS + MAIN_MS) {
        const localElapsed = elapsed - INTRO_MS;
        const entries: RaceRowData[] = runs.map((r, i) => {
          const finishMs = finishTimes[i];
          const done = localElapsed >= finishMs;
          const progressRatio = done ? 1 : localElapsed / finishMs;
          const idx = Math.min(r.frames.length - 1, Math.floor(progressRatio * (r.frames.length - 1)));
          const frame = r.frames[idx];
          return {
            name: r.name,
            array: frame.array,
            highlighted: done ? [] : frame.highlightedIndices,
            done,
            comparisons: frame.metrics.comparisons,
          };
        });
        drawRaceFrame(canvas, entries, tiktokHandle);
      } else if (elapsed < INTRO_MS + MAIN_MS + OUTRO_MS) {
        const outroT = (elapsed - INTRO_MS - MAIN_MS) / OUTRO_MS;
        drawRaceOutro(canvas, winnerName, outroT, tiktokHandle);
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