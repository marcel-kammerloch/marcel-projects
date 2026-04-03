"use client";

import { Play } from "lucide-react";

interface AudioPreviewSectionProps {
  duration: number;
  currentTime: number;
  startTime: string;
  endTime: string;
  setStartTime: (v: string) => void;
  setEndTime: (v: string) => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSetStart: () => void;
  handleSetEnd: () => void;
  playSnippet: (seekTime: number, durationLimit?: number) => void;
  fileSelected: boolean;
}

export default function AudioPreviewSection({
  duration,
  currentTime,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
  handleSeek,
  handleSetStart,
  handleSetEnd,
  playSnippet,
  fileSelected,
}: AudioPreviewSectionProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!fileSelected) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <label className="text-xs text-zinc-400 font-medium mb-1 block">
            Start Time (sec)
          </label>
          <input
            type="number"
            placeholder="0"
            min={0}
            max={endTime || duration || undefined}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={startTime || ""}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <button
            type="button"
            onClick={() => playSnippet(parseInt(startTime) || 0)}
            className="absolute right-2 top-[30px] p-1.5 text-blue-400 hover:text-blue-300 transition"
            title="Play 5s from start"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>

        <div className="relative">
          <label className="text-xs text-zinc-400 font-medium mb-1 block">
            End Time (sec)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder={duration > 0 ? duration.toString() : ""}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={endTime || ""}
              min={startTime || 0}
              max={duration || undefined}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() =>
              playSnippet(
                Math.max(0, (parseInt(endTime) || duration) - 5),
                5
              )
            }
            className="absolute right-2 top-[30px] p-1.5 text-blue-400 hover:text-blue-300 transition"
            title="Play last 5s until end"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      <div className="space-y-2 py-2">
        <div className="flex justify-between items-center text-xs text-zinc-400 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative h-6 flex items-center">
          <div className="absolute inset-x-0 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-blue-500/50 transition-all"
              style={{
                left: `${((parseInt(startTime) || 0) / duration) * 100}%`,
                right: `${
                  100 - ((parseInt(endTime) || duration) / duration) * 100
                }%`,
              }}
            />
          </div>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-x-0 w-full h-1.5 bg-transparent appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${(currentTime / (duration || 1)) * 100}%, transparent ${(currentTime / (duration || 1)) * 100}%)`,
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSetStart}
            className="flex-1 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-md transition border border-blue-500/10"
          >
            Set Start
          </button>
          <button
            type="button"
            onClick={handleSetEnd}
            className="flex-1 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-md transition border border-blue-500/10"
          >
            Set End
          </button>
        </div>
      </div>
    </div>
  );
}
