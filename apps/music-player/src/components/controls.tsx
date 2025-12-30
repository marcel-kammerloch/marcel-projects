import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
} from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  isShuffle,
  onToggleShuffle,
  isRepeat,
  onToggleRepeat,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={onToggleShuffle}
        className={`cursor-pointer p-2 rounded-full transition-colors ${
          isShuffle ? "text-blue-400" : "text-zinc-400 hover:text-white"
        }`}
        title="Shuffle"
      >
        <Shuffle size={20} />
      </button>

      <button
        onClick={onPrev}
        className="cursor-pointer p-2 text-zinc-200 hover:text-white transition-colors"
        title="Previous"
      >
        <SkipBack size={24} fill="currentColor" />
      </button>

      <button
        onClick={onPlayPause}
        className="cursor-pointer p-4 bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/10"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause size={28} fill="currentColor" />
        ) : (
          <Play size={28} fill="currentColor" className="ml-1" />
        )}
      </button>

      <button
        onClick={onNext}
        className="cursor-pointer p-2 text-zinc-200 hover:text-white transition-colors"
        title="Next"
      >
        <SkipForward size={24} fill="currentColor" />
      </button>

      <button
        onClick={onToggleRepeat}
        className={`cursor-pointer p-2 rounded-full transition-colors ${
          isRepeat ? "text-blue-400" : "text-zinc-400 hover:text-white"
        }`}
        title="Repeat"
      >
        <Repeat size={20} />
      </button>
    </div>
  );
}
