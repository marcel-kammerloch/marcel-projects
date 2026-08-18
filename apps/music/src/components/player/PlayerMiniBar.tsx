import { Pause, Play } from "lucide-react";

import type { Song } from "@db/client";

import { MusicIcon } from "@/components/player/playerUtils";

interface PlayerMiniBarProps {
  currentSong: Song;
  progress: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenFullView: () => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
}

export default function PlayerMiniBar({
  currentSong,
  progress,
  isPlaying,
  onTogglePlay,
  onOpenFullView,
  onTouchStart,
  onTouchEnd,
}: PlayerMiniBarProps) {
  return (
    <div
      className="fixed bottom-16 sm:bottom-16 left-0 right-0 h-16 sm:h-20 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 px-4 flex items-center justify-between cursor-pointer z-40 transition-transform duration-300"
      style={{ touchAction: "none" }}
      onClick={onOpenFullView}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800">
        <div
          className="h-full bg-blue-500 transition-all duration-100"
          style={{ width: `${(progress / (currentSong.duration || 1)) * 100}%` }}
        />
      </div>

      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 rounded-md flex items-center justify-center shrink-0 relative overflow-hidden">
          <div className="w-full h-full bg-linear-to-br from-blue-600 to-blue-600 opacity-80 absolute inset-0"></div>
          <MusicIcon className="w-5 h-5 text-white relative z-10" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-white font-medium text-sm sm:text-base truncate">
            {currentSong.title}
          </span>
          <span className="text-zinc-400 text-xs sm:text-sm truncate">
            {currentSong.artist || "Unknown Artist"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onTogglePlay();
          }}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5 ml-1" fill="currentColor" />
          )}
        </button>
      </div>
    </div>
  );
}
