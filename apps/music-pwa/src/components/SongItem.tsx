"use client";

import type { Song } from "@db/client";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, MoreVertical, CheckCircle } from "lucide-react";

interface SongItemProps {
  song: Song;
  index: number;
  isOffline: boolean;
  onPlay: (song: Song) => void;
  onMenuClick: (e: React.MouseEvent, songId: string) => void;
  activeMenuId: string | null;
}

export default function SongItem({
  song,
  index,
  isOffline,
  onPlay,
  onMenuClick,
  activeMenuId,
}: SongItemProps) {
  const { currentSong, isPlaying } = usePlayerStore();
  const isCurrent = currentSong?.id === song.id;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      onClick={() => onPlay(song)}
      className={`group flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors ${
        isCurrent
          ? "bg-blue-900/30 text-blue-400"
          : "hover:bg-zinc-800/50 text-zinc-300"
      }`}
    >
      <div className="w-10 flex items-center text-sm font-medium text-zinc-500 group-hover:text-blue-400">
        {isCurrent && isPlaying ? (
          <div className="flex items-end gap-[2px] h-4">
            <div className="w-1 bg-blue-500 animate-[bounce_1s_infinite_0ms] h-full"></div>
            <div className="w-1 bg-blue-500 animate-[bounce_1s_infinite_200ms] h-2/3"></div>
            <div className="w-1 bg-blue-500 animate-[bounce_1s_infinite_400ms] h-full"></div>
          </div>
        ) : isCurrent ? (
          <span className="text-blue-500">{index + 1}</span>
        ) : (
          <span className="group-hover:hidden">{index + 1}</span>
        )}
        {(!isCurrent || (isCurrent && !isPlaying)) && (
          <Play
            className={`w-4 h-4 fill-current hidden group-hover:block ${
              isCurrent ? "text-blue-500" : ""
            }`}
          />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <p
            className={`text-base font-medium truncate ${
              isCurrent ? "text-white" : "group-hover:text-white"
            }`}
          >
            {song.title}
          </p>
          {isOffline && (
            <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0" />
          )}
        </div>
        <p className="text-sm text-zinc-500 truncate sm:hidden">
          {song.artist || "Unknown"}
        </p>
      </div>

      <div className="hidden sm:block flex-1 min-w-0 text-sm text-zinc-500 pr-4 truncate">
        {song.artist || "Unknown Artist"}
      </div>

      <div className="w-16 flex justify-end text-sm text-zinc-500 tabular-nums">
        {formatTime(song.duration)}
      </div>

      <div className="w-10 flex justify-end relative">
        <button
          className={`p-2 hover:text-white transition-opacity focus:opacity-100 ${
            activeMenuId === song.id
              ? "text-white"
              : "text-zinc-500 opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => onMenuClick(e, song.id)}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
