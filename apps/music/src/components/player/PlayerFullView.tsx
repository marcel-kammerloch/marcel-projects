import { ChevronDown } from "lucide-react";

import AudioVisualizer from "@/components/player/AudioVisualizer";
import PlayerControls from "@/components/player/PlayerControls";
import PlayerSettingsMenu from "@/components/player/PlayerSettingsMenu";
import { formatTime, getGradient, MusicIcon } from "@/components/player/playerUtils";

import type { Song } from "@db/client";

interface PlayerFullViewProps {
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
    loop: "off" | "once" | "repeat";
    shuffle: boolean;
    skipDuration: number;
    saveBattery: boolean;
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
  return (
    <div
      className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col transition-transform duration-500 ease-out translate-y-0"
      style={{ touchAction: "none" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-900 dark:text-white p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
          >
            <ChevronDown className="w-8 h-8" />
          </button>

          <div className="flex-1 min-w-0 px-2 text-center">
            <p className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
              Now Playing
            </p>
            {playbackSourceType && playbackSourceName && (
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5 wrap-break-word line-clamp-2 px-1">
                Playing from {playbackSourceType} &ldquo;{playbackSourceName}&rdquo;
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

        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            className="w-60 h-60 sm:w-72 sm:h-72 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden group"
            style={{ background: getGradient(currentSong.id) }}
          >
            <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
            <MusicIcon className="w-20 h-20 text-white/50 relative z-10" />
          </div>
        </div>

        {!settings.saveBattery && (
          <div className="mt-3 mb-1">
            <AudioVisualizer
              analyser={analyser}
              isPlaying={isPlaying}
              className="max-w-xs mx-auto"
            />
          </div>
        )}

        <div className="mt-2 mb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white truncate">
                {currentSong.title}
              </h2>
              <p className="text-base text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {currentSong.artist || "Unknown Artist"}
              </p>
            </div>

            <button
              type="button"
              onClick={onTogglePlayOnlyThisSong}
              aria-pressed={playOnlyThisSong}
              className={`shrink-0 flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                playOnlyThisSong
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/50"
                  : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
              }`}
              title={
                playOnlyThisSong
                  ? "Active: Playback will stop after this song"
                  : "Enable to stop playback after this song finishes"
              }
            >
              <span>{playOnlyThisSong ? "Play 1x (Active)" : "Play 1x"}</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="range"
            min={0}
            max={currentSong.duration || 100}
            value={progress}
            onChange={(event) => onSeek(Number(event.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{
              background: `linear-gradient(to right, #3b82f6 ${(progress / (currentSong.duration || 1)) * 100}%, ${typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "#27272a" : "#e4e4e7"} ${(progress / (currentSong.duration || 1)) * 100}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-zinc-500 font-medium mt-2">
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
