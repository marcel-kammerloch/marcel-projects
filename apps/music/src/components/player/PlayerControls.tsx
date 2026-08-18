import { Pause, Play, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  settings: {
    loop: "off" | "once" | "repeat";
    shuffle: boolean;
    skipDuration: number;
  };
  onTogglePlay: () => void;
  onPlayPrevious: () => void;
  onPlayNext: () => void;
  onToggleShuffle: () => void;
  onToggleLoop: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
}

export default function PlayerControls({
  isPlaying,
  settings,
  onTogglePlay,
  onPlayPrevious,
  onPlayNext,
  onToggleShuffle,
  onToggleLoop,
  onSkipBackward,
  onSkipForward,
}: PlayerControlsProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-8 max-w-[80%] w-full mx-auto">
        <button
          type="button"
          onClick={onToggleShuffle}
          className={`p-2 rounded-full transition ${
            settings.shuffle
              ? "text-blue-500"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Shuffle className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onPlayPrevious}
            className="text-zinc-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition"
          >
            <SkipBack className="w-10 h-10" fill="currentColor" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className="w-20 h-20 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-zinc-500/20 dark:shadow-white/15"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10" fill="currentColor" />
            ) : (
              <Play className="w-10 h-10 ml-2" fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            onClick={onPlayNext}
            className="text-zinc-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition"
          >
            <SkipForward className="w-10 h-10" fill="currentColor" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleLoop}
          aria-label={`Loop ${settings.loop}`}
          className={`relative p-2 rounded-full transition ${
            settings.loop !== "off"
              ? "text-blue-500"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Repeat className="w-6 h-6" />
          {settings.loop === "once" && (
            <span className="absolute top-1/2 left-1/2 text-[10px] font-bold bg-blue-500 text-white rounded-full min-w-4 h-4 flex items-center justify-center px-1">
              1
            </span>
          )}
        </button>
      </div>

      <div className="flex justify-center gap-8 text-zinc-500 font-medium text-sm pb-8">
        <button
          type="button"
          onClick={onSkipBackward}
          className="hover:text-zinc-900 dark:hover:text-white flex items-center transition bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800"
        >
          -{settings.skipDuration}s
        </button>
        <button
          type="button"
          onClick={onSkipForward}
          className="hover:text-zinc-900 dark:hover:text-white flex items-center transition bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800"
        >
          +{settings.skipDuration}s
        </button>
      </div>

    </>
  );
}
