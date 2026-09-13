import { Pause, Play } from "lucide-react";
import type { Song } from "@db/client";
import { MusicIcon, getGradient } from "@/components/player/playerUtils";
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();

  return (
    <div
      className="group fixed bottom-16 left-0 right-0 h-16 sm:h-18 bg-zinc-900/95 hover:bg-zinc-900/98 backdrop-blur-xl border-t border-zinc-800 px-4 z-40 transition-colors duration-200 cursor-pointer shadow-lg shadow-black/40"
      style={{ touchAction: "none" }}
      onClick={onOpenFullView}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-800/80">
        <div
          className="h-full bg-blue-500 transition-all duration-100 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
          style={{
            width: `${(progress / (currentSong.duration || 1)) * 100}%`,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto w-full h-full flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden min-w-0 pr-2">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden shadow-sm border border-white/10"
            style={{ background: getGradient(currentSong.id) }}
          >
            <div className="w-full h-full bg-black/20 absolute inset-0"></div>
            <MusicIcon className="w-5 h-5 text-white/80 relative z-10" />
          </div>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-white font-semibold text-sm sm:text-base truncate group-hover:text-blue-400 transition-colors">
              {currentSong.title}
            </span>
            <span className="text-zinc-400 text-xs sm:text-sm truncate">
              {currentSong.artist || t.common.unknownArtist}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-3 shrink-0"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onTogglePlay();
            }}
            title={isPlaying ? t.player.pause : t.player.play}
            aria-label={isPlaying ? t.player.pause : t.player.play}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md hover:bg-zinc-100"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
