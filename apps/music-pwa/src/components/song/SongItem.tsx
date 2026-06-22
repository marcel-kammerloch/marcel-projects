"use client";

import type { Song } from "@db/client";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, MoreVertical, CheckCircle, GripVertical } from "lucide-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SongContextMenu, { SongMenuActions } from "./SongContextMenu";

interface SongItemProps {
  song: Song;
  index: number;
  onPlay: (song: Song) => void;
  onMenuClick: (songId: string) => void;
  activeMenuId: string | null;
  actions: SongMenuActions;
}

export default function SongItem({
  song,
  index,
  onPlay,
  onMenuClick,
  activeMenuId,
  actions,
}: SongItemProps) {
  const { currentSong, isPlaying } = usePlayerStore();
  const isCurrent = currentSong?.id === song.id;
  const isOpen = activeMenuId === song.id;
  const [openUpwards, setOpenUpwards] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center px-4 py-3 rounded-xl transition-colors ${
        isCurrent
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300"
      } ${isDragging ? "opacity-50 z-50 bg-white dark:bg-zinc-800" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="touch-none w-10 flex items-center justify-center cursor-grab active:cursor-grabbing text-zinc-400 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div
        className="w-10 flex items-center text-sm font-medium text-zinc-500 group-hover:text-blue-400 cursor-pointer"
        onClick={() => onPlay(song)}
      >
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

      <div
        className="flex-1 min-w-0 pr-4 cursor-pointer"
        onClick={() => onPlay(song)}
      >
        <div className="flex items-center gap-2">
          <p
            className={`text-base font-medium truncate ${
              isCurrent ? "text-zinc-900 dark:text-white" : "group-hover:text-zinc-900 dark:group-hover:text-white"
            }`}
          >
            {song.title}
          </p>
        </div>
        <p className="text-sm text-zinc-500 truncate sm:hidden">
          {song.artist || "Unknown"}
        </p>
      </div>

      <div
        className="hidden sm:block flex-1 min-w-0 text-sm text-zinc-500 pr-4 truncate cursor-pointer"
        onClick={() => onPlay(song)}
      >
        {song.artist || "Unknown Artist"}
      </div>

      <div
        className="w-16 flex justify-end text-sm text-zinc-500 tabular-nums cursor-pointer"
        onClick={() => onPlay(song)}
      >
        {formatTime(song.duration)}
      </div>

      <div className="w-10 flex justify-end relative">
        <button
          className={`p-2 hover:text-zinc-900 dark:hover:text-white transition-opacity focus:opacity-100 ${
            isOpen
              ? "text-zinc-900 dark:text-white"
              : "text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setOpenUpwards(rect.bottom + 300 > window.innerHeight);
            onMenuClick(song.id);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        <SongContextMenu
          song={song}
          isOpen={isOpen}
          onClose={() => onMenuClick("")}
          actions={actions}
          openUpwards={openUpwards}
        />
      </div>
    </div>
  );
}
