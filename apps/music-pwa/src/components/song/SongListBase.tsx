"use client";

import { useState, useEffect } from "react";
import type { Song } from "@db/client";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Clock, Music } from "lucide-react";
import { deleteSong } from "@/actions/song";
import { addSongToPlaylist, removeSongFromPlaylist } from "@/actions/playlist";
import { reorderSongs, reorderPlaylistSongs } from "@/actions/order";
import EditSongModal from "./EditSongModal";
import SongItem from "./SongItem";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface SongListBaseProps {
  songs: Song[];
  title?: string;
  subtitle?: string;
  playlistId?: string;
}

export default function SongListBase({
  songs,
  title,
  subtitle,
  playlistId,
}: SongListBaseProps) {
  const { playSong } = usePlayerStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [localSongs, setLocalSongs] = useState(songs);

  useEffect(() => {
    setLocalSongs(songs);
  }, [songs]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localSongs.findIndex((s) => s.id === active.id);
      const newIndex = localSongs.findIndex((s) => s.id === over.id);

      const newSongs = arrayMove(localSongs, oldIndex, newIndex);
      setLocalSongs(newSongs);

      if (playlistId) {
        await reorderPlaylistSongs(
          playlistId,
          newSongs.map((s) => s.id),
        );
      } else {
        await reorderSongs(newSongs.map((s) => s.id));
      }
    }
  };

  const handlePlay = (song: Song) => {
    playSong(song, songs, playlistId && title ? title : null);
  };

  const handleDeleteRequest = (songId: string) => {
    setSongToDelete(songId);
    setActiveMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!songToDelete) return;

    try {
      await deleteSong(songToDelete);
      toast.success("Song deleted");
      setSongToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete song");
    }
  };

  const handleAddSongToPlaylist = async (
    playlistId: string,
    songId: string,
  ) => {
    try {
      await addSongToPlaylist(playlistId, songId);
      toast.success("Added to playlist!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to playlist");
    }
  };

  const handleRemoveFromPlaylist = async (songId: string) => {
    if (!playlistId) return;
    try {
      await removeSongFromPlaylist(playlistId, songId);
      toast.success("Removed from playlist");
      setActiveMenu(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove from playlist");
    }
  };

  const toggleMenu = (songId: string) => {
    setActiveMenu(activeMenu === songId ? null : songId);
  };

  const displayedSongs = localSongs;

  if (displayedSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <Music className="w-12 h-12 mb-4 opacity-50" />
        <p>No songs found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-24 touch-manipulation">
      {(title || subtitle) && (
        <div className="mb-4 mt-4">
          {title && (
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-zinc-500 text-sm">{subtitle}</p>}
        </div>
      )}

      {/* Column Headers */}
      <div className="flex px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        <div className="w-10"></div>
        <div className="w-10 flex items-center justify-start">#</div>
        <div className="flex-1 pr-4">Title</div>
        <div className="hidden sm:block flex-1 pr-4">Artist</div>
        <div className="w-16 flex justify-end">
          <Clock className="w-4 h-4" />
        </div>
        <div className="w-10"></div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={displayedSongs.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {displayedSongs.map((song, index) => (
            <SongItem
              key={song.id}
              song={song}
              index={index}
              onPlay={handlePlay}
              onMenuClick={toggleMenu}
              activeMenuId={activeMenu}
              actions={{
                onEdit: () => setEditingSong(song),
                onDelete: () => handleDeleteRequest(song.id),
                onAddSongToPlaylist: (plId) =>
                  handleAddSongToPlaylist(plId, song.id),
                onRemoveFromPlaylist: playlistId
                  ? () => handleRemoveFromPlaylist(song.id)
                  : undefined,
              }}
            />
          ))}
        </SortableContext>
      </DndContext>

      {editingSong && (
        <EditSongModal
          song={editingSong}
          isOpen={!!editingSong}
          onClose={() => {
            setEditingSong(null);
            setActiveMenu(null);
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!songToDelete}
        onOpenChange={(open) => !open && setSongToDelete(null)}
        title="Delete Song"
        description="Are you sure you want to delete this song? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
}
