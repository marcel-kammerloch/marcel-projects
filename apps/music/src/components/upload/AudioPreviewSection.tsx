"use client";

import { Play, Gauge, ShieldCheck, Clock, Scissors, RotateCcw } from "lucide-react";
import AudioWaveform from "./AudioWaveform";

interface AudioPreviewSectionProps {
  file: File | null;
  duration: number;
  currentTime: number;
  startTime: string;
  endTime: string;
  speed: number;
  setStartTime: (v: string) => void;
  setEndTime: (v: string) => void;
  setSpeed: (v: number) => void;
  handleSeek: (time: number) => void;
  handleSetStart: () => void;
  handleSetEnd: () => void;
  playSnippet: (seekTime: number, durationLimit?: number) => void;
  fileSelected: boolean;
}

const SPEED_PRESETS = [0.75, 0.9, 1.0, 1.1, 1.25, 1.5];

export default function AudioPreviewSection({
  file,
  duration,
  currentTime,
  startTime,
  endTime,
  speed,
  setStartTime,
  setEndTime,
  setSpeed,
  handleSeek,
  handleSetStart,
  handleSetEnd,
  playSnippet,
  fileSelected,
}: AudioPreviewSectionProps) {
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00.0";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${tenths}`;
  };

  const parsedStart = startTime !== "" ? parseFloat(startTime) : 0;
  const parsedEnd = endTime !== "" ? parseFloat(endTime) : duration;
  const trimDuration = Math.max(0, parsedEnd - parsedStart);
  const finalDuration = speed > 0 ? trimDuration / speed : trimDuration;

  if (!fileSelected) return null;

  const adjustStart = (delta: number) => {
    const current = startTime !== "" ? parseFloat(startTime) : 0;
    const maxLimit = endTime !== "" ? parseFloat(endTime) - 0.1 : duration;
    const next = Math.max(0, Math.min(maxLimit, Math.round((current + delta) * 10) / 10));
    setStartTime(next.toFixed(1));
  };

  const adjustEnd = (delta: number) => {
    const current = endTime !== "" ? parseFloat(endTime) : duration;
    const minLimit = startTime !== "" ? parseFloat(startTime) + 0.1 : 0.1;
    const next = Math.max(minLimit, Math.min(duration, Math.round((current + delta) * 10) / 10));
    setEndTime(next.toFixed(1));
  };

  return (
    <div className="space-y-5 bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
      {/* Studio Waveform & Timeline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
            <Scissors className="w-3.5 h-3.5 text-blue-500" />
            <span>Interactive Trimming Waveform</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
            <span>Pos: {formatTime(currentTime)}</span>
            <span>Total: {formatTime(duration)}</span>
          </div>
        </div>

        <AudioWaveform
          file={file}
          duration={duration}
          currentTime={currentTime}
          startTime={parsedStart}
          endTime={parsedEnd}
          onSeek={handleSeek}
          onStartChange={(time) => setStartTime(time.toFixed(1))}
          onEndChange={(time) => setEndTime(time.toFixed(1))}
        />

        <div className="flex justify-between items-center text-[10px] text-zinc-400 px-1 font-mono">
          <span>0.0s</span>
          <span>Click to scrub • Drag blue handles to trim</span>
          <span>{duration.toFixed(1)}s</span>
        </div>
      </div>

      {/* 0.1s Precision Start & End Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Start Time Box */}
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="start-time-input" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Start Time (0.1s precision)
            </label>
            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-medium">
              {formatTime(parsedStart)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              id="start-time-input"
              type="number"
              step="0.1"
              min="0"
              max={parsedEnd > 0 ? (parsedEnd - 0.1).toFixed(1) : undefined}
              placeholder="0.0"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-1 min-w-0 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => playSnippet(parsedStart, 5)}
              className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition"
              title="Play 5s from start"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-1 pt-0.5">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => adjustStart(-1.0)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
              >
                -1.0s
              </button>
              <button
                type="button"
                onClick={() => adjustStart(-0.1)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
              >
                -0.1s
              </button>
              <button
                type="button"
                onClick={() => adjustStart(0.1)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
              >
                +0.1s
              </button>
              <button
                type="button"
                onClick={() => adjustStart(1.0)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
              >
                +1.0s
              </button>
            </div>
            <button
              type="button"
              onClick={handleSetStart}
              className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Set Playhead
            </button>
          </div>
        </div>

        {/* End Time Box */}
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="end-time-input" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              End Time (0.1s precision)
            </label>
            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-medium">
              {formatTime(parsedEnd)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              id="end-time-input"
              type="number"
              step="0.1"
              min={parsedStart > 0 ? (parsedStart + 0.1).toFixed(1) : "0.1"}
              max={duration > 0 ? duration.toFixed(1) : undefined}
              placeholder={duration > 0 ? duration.toFixed(1) : "0.0"}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-1 min-w-0 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => playSnippet(Math.max(parsedStart, parsedEnd - 5), 5)}
              className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition"
              title="Play last 5s until end"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-1 pt-0.5">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => adjustEnd(-1.0)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
              >
                -1.0s
              </button>
              <button
                type="button"
                onClick={() => adjustEnd(-0.1)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
              >
                -0.1s
              </button>
              <button
                type="button"
                onClick={() => adjustEnd(0.1)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
              >
                +0.1s
              </button>
              <button
                type="button"
                onClick={() => adjustEnd(1.0)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded"
              >
                +1.0s
              </button>
            </div>
            <button
              type="button"
              onClick={handleSetEnd}
              className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Set Playhead
            </button>
          </div>
        </div>
      </div>

      {/* Speed Adjustment Section (0.50x – 1.50x, 0.01x steps, Pitch Preserved) */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Audio Speed & Tempo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pitch preserved
            </span>
            <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 min-w-12 text-right">
              {speed.toFixed(2)}×
            </span>
          </div>
        </div>

        {/* Speed Slider + Steppers */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSpeed(Math.max(0.5, Math.round((speed - 0.01) * 100) / 100))}
            className="px-2 py-1 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded transition"
            title="Decrease 0.01x"
          >
            -0.01
          </button>

          <input
            type="range"
            min="0.50"
            max="1.50"
            step="0.01"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <button
            type="button"
            onClick={() => setSpeed(Math.min(1.5, Math.round((speed + 0.01) * 100) / 100))}
            className="px-2 py-1 text-xs font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded transition"
            title="Increase 0.01x"
          >
            +0.01
          </button>
        </div>

        {/* Speed Preset Pills */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap pt-1">
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSpeed(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                Math.abs(speed - preset) < 0.005
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {preset.toFixed(2)}×
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSpeed(1.0)}
            className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 transition"
            title="Reset to 1.00x"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Processing Summary Bar */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Trimmed: {formatTime(trimDuration)}</span>
          </div>
          <div className="font-semibold text-zinc-900 dark:text-white">
            Resulting Track Duration: <span className="text-blue-600 dark:text-blue-400">{formatTime(finalDuration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
