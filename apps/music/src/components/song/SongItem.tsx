"use client";

import type { Song } from "@db/client";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Play, MoreVertical, GripVertical } from "lucide-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SongContextMenu, { SongMenuActions } from "./SongContextMenu";
import { useTranslation } from "@/lib/i18n";

interface SongItemProps {
  song: Song;
  index: number;
  onPlay: (song: Song) => void;
  onMenuClick: (songId: string) => void;
  activeMenuId: string | null;
  actions: SongMenuActions;
  dragDisabled?: boolean;
}

export default function SongItem({
  song,
  index,
  onPlay,
  onMenuClick,
  activeMenuId,
  actions,
  dragDisabled = false,
}: SongItemProps) {
  const { currentSong, isPlaying } = usePlayerStore();
  const { t } = useTranslation();
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
  } = useSortable({ id: song.id, disabled: dragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center px-1 md:px-4 py-2.5 rounded-xl transition-all duration-150 ${
        isCurrent
          ? "bg-blue-950/40 border border-blue-800/30 text-blue-400 hc:ring-2 hc:ring-zinc-400 shadow-xs"
          : "hover:bg-zinc-800/60 active:bg-zinc-800/80 text-zinc-300"
      } ${isDragging ? "opacity-50 z-50 bg-zinc-850" : ""}`}
    >
      {!dragDisabled && (
        <div
          {...attributes}
          {...listeners}
          className="touch-none w-10 flex items-center justify-center cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      )}

      <div
        className="w-10 flex items-center text-sm font-medium text-zinc-400 group-hover:text-blue-400 cursor-pointer"
        onClick={() => onPlay(song)}
      >
        {isCurrent && isPlaying ? (
          <div className="flex items-end gap-0.5 h-3.5">
            <div className="w-1 bg-blue-400 rounded-full animate-[bounce_1s_infinite_0ms] h-full"></div>
            <div className="w-1 bg-blue-400 rounded-full animate-[bounce_1s_infinite_200ms] h-2/3"></div>
            <div className="w-1 bg-blue-400 rounded-full animate-[bounce_1s_infinite_400ms] h-full"></div>
          </div>
        ) : isCurrent ? (
          <span className="text-blue-400 font-semibold">{index + 1}</span>
        ) : (
          <span className="group-hover:hidden text-zinc-500">{index + 1}</span>
        )}
        {(!isCurrent || (isCurrent && !isPlaying)) && (
          <Play
            className={`w-4 h-4 fill-current hidden group-hover:block transition-transform hover:scale-110 ${
              isCurrent ? "text-blue-400" : "text-white"
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
            className={`text-sm sm:text-base font-medium truncate ${
              isCurrent ? "text-white font-semibold" : "group-hover:text-white"
            }`}
          >
            {song.title}
          </p>
        </div>
        <p className="text-xs text-zinc-400 truncate sm:hidden mt-0.5">
          {song.artist || t.common.unknown}
        </p>
      </div>

      <div
        className="hidden sm:block flex-1 min-w-0 text-sm text-zinc-400 pr-4 truncate cursor-pointer"
        onClick={() => onPlay(song)}
      >
        {song.artist || t.common.unknownArtist}
      </div>

      <div
        className="w-16 flex justify-end text-sm text-zinc-400 tabular-nums cursor-pointer font-medium"
        onClick={() => onPlay(song)}
      >
        {formatTime(song.duration)}
      </div>

      <div className="w-10 flex justify-end relative">
        <button
          type="button"
          title="More options"
          aria-label="More options"
          className={`p-2 hover:text-white rounded-lg hover:bg-zinc-750 transition-all focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 cursor-pointer ${
            isOpen
              ? "text-white bg-zinc-800"
              : "text-zinc-500 opacity-0 group-hover:opacity-100"
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
