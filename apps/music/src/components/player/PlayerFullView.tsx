import { ChevronDown, Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavoritesStore } from "@/store/useFavoritesStore";

import AudioVisualizer from "@/components/player/AudioVisualizer";
import PlayerControls from "@/components/player/PlayerControls";
import PlayerSettingsMenu from "@/components/player/PlayerSettingsMenu";
import {
  formatTime,
  getGradient,
  MusicIcon,
} from "@/components/player/playerUtils";
import { useTranslation } from "@/lib/i18n";

import type { Song } from "@db/client";
import { LoopMode } from "@/store/usePlayerStore";

interface PlayerFullViewProps {
  isFullView: boolean;
  currentSong: Song;
  progress: number;
  isPlaying: boolean;
  analyser: AnalyserNode | null;
  playbackSourceType: "playlist" | "genre" | null;
  playbackSourceName: string | null;
  playOnlyThisSong: boolean;
  playbackRate: number;
  volume: number;
  settings: {
    loop: LoopMode;
    shuffle: boolean;
    skipDuration: number;
    saveBattery: boolean;
    reduceAnimations: boolean;
  };
  onClose: () => void;
  onTogglePlay: () => void;
  onPlayPrevious: () => void;
  onPlayNext: () => void;
  onToggleShuffle: () => void;
  onToggleLoop: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onSeek: (time: number) => void;
  onTogglePlayOnlyThisSong: () => void;
  onPlaybackRateChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onMenuOpenChange: (value: boolean) => void;
  menuOpen: boolean;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
}

export default function PlayerFullView({
  isFullView,
  currentSong,
  progress,
  isPlaying,
  analyser,
  playbackSourceType,
  playbackSourceName,
  playOnlyThisSong,
  playbackRate,
  volume,
  settings,
  onClose,
  onTogglePlay,
  onPlayPrevious,
  onPlayNext,
  onToggleShuffle,
  onToggleLoop,
  onSkipBackward,
  onSkipForward,
  onSeek,
  onTogglePlayOnlyThisSong,
  onPlaybackRateChange,
  onVolumeChange,
  onMenuOpenChange,
  menuOpen,
  onTouchStart,
  onTouchEnd,
}: PlayerFullViewProps) {
  const { t } = useTranslation();

  const isFav = useFavoritesStore((state) =>
    state.favoriteSongIds.includes(currentSong.id),
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleToggleFavorite = () => {
    const newlyAdded = toggleFavorite(currentSong.id);
    if (newlyAdded) {
      toast.success(t.favorites.addedToast);
    } else {
      toast.success(t.favorites.removedToast);
    }
  };

  const sourceTypeLabel =
    playbackSourceType === "playlist"
      ? t.player.sourceTypes.playlist
      : playbackSourceType === "genre"
        ? t.player.sourceTypes.genre
        : "";

  return (
    <div
      className={`fixed inset-0 bg-zinc-950 z-50 flex flex-col transition-transform duration-500 ease-out ${isFullView ? "translate-y-0" : "translate-y-full"}`}
      style={{ touchAction: "none" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            title="Close player"
            aria-label="Close player"
            className="text-white p-2 hover:bg-zinc-800 active:scale-95 rounded-full transition cursor-pointer"
          >
            <ChevronDown className="w-8 h-8" />
          </button>

          <div className="flex-1 min-w-0 px-2 text-center">
            <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              {t.player.nowPlaying}
            </p>
            {playbackSourceType && playbackSourceName && (
              <p className="text-xs font-semibold text-zinc-400 mt-0.5 wrap-break-word line-clamp-2 px-1">
                {t.player.playingFrom(sourceTypeLabel, playbackSourceName)}
              </p>
            )}
          </div>

          <PlayerSettingsMenu
            open={menuOpen}
            onOpenChange={onMenuOpenChange}
            playbackRate={playbackRate}
            volume={volume}
            playOnlyThisSong={playOnlyThisSong}
            onPlaybackRateChange={onPlaybackRateChange}
            onVolumeChange={onVolumeChange}
            onTogglePlayOnlyThisSong={onTogglePlayOnlyThisSong}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center py-2 sm:py-4">
          <div
            className="w-60 h-60 sm:w-72 sm:h-72 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden group ring-1 ring-white/10 transition-transform duration-300"
            style={{
              background: getGradient(currentSong.id),
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px -10px rgba(59, 130, 246, 0.2)",
            }}
          >
            <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
            <MusicIcon className="w-20 h-20 text-white/50 relative z-10 transition-transform duration-300 group-hover:scale-105" />
          </div>
        </div>

        {!settings.reduceAnimations && (
          <div className="mt-3 mb-1">
            <AudioVisualizer
              analyser={analyser}
              isPlaying={isPlaying}
              className="max-w-xs mx-auto"
            />
          </div>
        )}

        <div className="mt-2 mb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-white truncate tracking-tight">
                {currentSong.title}
              </h2>
              <p className="text-base text-zinc-400 truncate mt-0.5">
                {currentSong.artist || t.common.unknownArtist}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleFavorite}
                aria-label={
                  isFav
                    ? t.favorites.removeFromFavorites
                    : t.favorites.addToFavorites
                }
                title={
                  isFav
                    ? t.favorites.removeFromFavorites
                    : t.favorites.addToFavorites
                }
                className="p-2.5 rounded-full hover:bg-zinc-850 active:scale-90 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
              >
                <Heart
                  className={`w-6 h-6 transition-all duration-200 ${
                    isFav
                      ? "text-rose-500 fill-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={onTogglePlayOnlyThisSong}
                aria-pressed={playOnlyThisSong}
                className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  playOnlyThisSong
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/50"
                    : "bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80"
                }`}
                title={
                  playOnlyThisSong
                    ? t.player.play1xTooltipActive
                    : t.player.play1xTooltipInactive
                }
              >
                <span>
                  {playOnlyThisSong ? t.player.play1xActive : t.player.play1x}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="range"
            min={0}
            max={currentSong.duration || 100}
            value={progress}
            onChange={(event) => onSeek(Number(event.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${(progress / (currentSong.duration || 1)) * 100}%, #27272a ${(progress / (currentSong.duration || 1)) * 100}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-zinc-400 font-medium tabular-nums mt-2">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(currentSong.duration)}</span>
          </div>
        </div>

        <PlayerControls
          isPlaying={isPlaying}
          settings={settings}
          onTogglePlay={onTogglePlay}
          onPlayPrevious={onPlayPrevious}
          onPlayNext={onPlayNext}
          onToggleShuffle={onToggleShuffle}
          onToggleLoop={onToggleLoop}
          onSkipBackward={onSkipBackward}
          onSkipForward={onSkipForward}
        />
      </div>
    </div>
  );
}
