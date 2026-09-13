import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import type { LoopMode } from "@/store/usePlayerStore";

interface PlayerControlsProps {
  isPlaying: boolean;
  settings: {
    loop: LoopMode;
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
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-between mb-8 mx-2">
        <button
          type="button"
          onClick={onToggleShuffle}
          title={t.player.shuffle}
          aria-label={t.player.shuffle}
          className={`p-2.5 rounded-full transition-all active:scale-90 cursor-pointer ${
            settings.shuffle
              ? "text-blue-500 hc:bg-blue-500/20 hc:ring-2 hc:ring-blue-500/50 hc:text-blue-400"
              : "text-zinc-500 hover:text-white hc:text-zinc-400"
          }`}
        >
          <Shuffle className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onPlayPrevious}
            title={t.player.previousTrack}
            aria-label={t.player.previousTrack}
            className="p-2 rounded-full text-white hover:text-blue-400 active:scale-95 transition-all cursor-pointer"
          >
            <SkipBack className="w-10 h-10" fill="currentColor" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            title={isPlaying ? t.player.pause : t.player.play}
            aria-label={isPlaying ? t.player.pause : t.player.play}
            className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/20 hover:shadow-white/30 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10" fill="currentColor" />
            ) : (
              <Play className="w-10 h-10 ml-1.5" fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            onClick={onPlayNext}
            title={t.player.nextTrack}
            aria-label={t.player.nextTrack}
            className="p-2 rounded-full text-white hover:text-blue-400 active:scale-95 transition-all cursor-pointer"
          >
            <SkipForward className="w-10 h-10" fill="currentColor" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToggleLoop}
          title={t.player.loopMode(settings.loop)}
          aria-label={t.player.loopMode(settings.loop)}
          className={`relative p-2.5 rounded-full transition-all active:scale-90 cursor-pointer ${
            settings.loop !== "off"
              ? "text-blue-500 hover:text-blue-400 hc:bg-blue-500/20 hc:ring-2 hc:ring-blue-500/50 hc:text-blue-400"
              : "text-zinc-500 hover:text-white hc:text-zinc-400"
          }`}
        >
          <Repeat className="w-6 h-6" />
          {settings.loop === "once" && (
            <span className="absolute top-1/2 left-1/2 text-[9px] font-extrabold bg-blue-500 text-white rounded-full min-w-3.5 h-3.5 flex items-center justify-center px-0.5 shadow-sm">
              1
            </span>
          )}
          {settings.loop === "repeat" && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
          )}
        </button>
      </div>

      <div className="flex justify-center gap-6 text-zinc-400 font-medium text-xs sm:text-sm pb-8">
        <button
          type="button"
          onClick={onSkipBackward}
          className="hover:text-white flex items-center transition bg-zinc-900/90 hover:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-700 active:scale-95 cursor-pointer shadow-sm"
        >
          -{settings.skipDuration}s
        </button>
        <button
          type="button"
          onClick={onSkipForward}
          className="hover:text-white flex items-center transition bg-zinc-900/90 hover:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-800 hover:border-zinc-700 active:scale-95 cursor-pointer shadow-sm"
        >
          +{settings.skipDuration}s
        </button>
      </div>
    </>
  );
}
