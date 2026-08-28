"use client";

import { useState, useEffect } from "react";
import type { Song, Genre } from "@db/client";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useTranslation } from "@/lib/i18n";
import { Clock, Music } from "lucide-react";
import { deleteSong } from "@/actions/song";
import { addSongToPlaylist, removeSongFromPlaylist } from "@/actions/playlist";
import { reorderSongs, reorderPlaylistSongs } from "@/actions/order";
import { reorderGenreSongs } from "@/actions/genre";
import EditSongModal from "./EditSongModal";
import SongItem from "./SongItem";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuth } from "@repo/auth/client";

export type SortMode =
  | "manual"
  | "duration"
  | "date-desc"
  | "date-asc"
  | "name";

interface SongListBaseProps {
  songs: Song[];
  title?: string;
  subtitle?: string;
  playlistId?: string;
  genreKey?: Genre;
  playbackSourceType?: "playlist" | "genre" | null;
  playbackSourceName?: string | null;
  showSortSelector?: boolean;
}

export default function SongListBase({
  songs,
  title,
  subtitle,
  playlistId,
  genreKey,
  playbackSourceType,
  playbackSourceName,
  showSortSelector = true,
}: SongListBaseProps) {
  const { playSong } = usePlayerStore();
  const { removeFavorite } = useFavoritesStore();
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
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

  const [sortBy, setSortBy] = useState<SortMode>("manual");

  const displayedSongs = [...localSongs].sort((a, b) => {
    if (sortBy === "name") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "date-desc") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "date-asc") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "duration") {
      return a.duration - b.duration;
    }
    return 0;
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localSongs.findIndex((s) => s.id === active.id);
      const newIndex = localSongs.findIndex((s) => s.id === over.id);

      const newSongs = arrayMove(localSongs, oldIndex, newIndex);
      setLocalSongs(newSongs);

      if (playlistId === "favorites") {
        // Local only Favorites list - no db call
        return;
      }

      if (genreKey) {
        // Genre-specific order — does NOT touch Song.order
        await reorderGenreSongs(
          genreKey,
          newSongs.map((s) => s.id),
        );
      } else if (playlistId) {
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
    playSong(
      song,
      displayedSongs,
      playlistId && title ? title : null,
      playbackSourceType,
      playbackSourceName,
    );
  };

  const handleDeleteRequest = (songId: string) => {
    setSongToDelete(songId);
    setActiveMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!songToDelete) return;

    try {
      const { error, success } = await deleteSong(songToDelete);

      if (success) {
        toast.success(t.songMenu.deleteSuccess);
      } else if (error) {
        toast.error(t.songMenu.deleteError);
      }

      setSongToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error(t.songMenu.deleteError);
    }
  };

  const handleAddSongToPlaylist = async (
    targetPlaylistId: string,
    songId: string,
  ) => {
    try {
      const { error } = await addSongToPlaylist(targetPlaylistId, songId);

      if (error) {
        toast.error(t.songMenu.addedToPlaylistError);
      } else {
        toast.success(t.songMenu.addedToPlaylistSuccess);
      }
    } catch (error) {
      console.error(error);
      toast.error(t.songMenu.addedToPlaylistError);
    }
  };

  const handleRemoveFromPlaylist = async (songId: string) => {
    if (!playlistId) return;

    if (playlistId === "favorites") {
      removeFavorite(songId);
      toast.success(t.favorites.removedToast);
      setActiveMenu(null);
      return;
    }

    try {
      const { error } = await removeSongFromPlaylist(playlistId, songId);

      if (error) {
        toast.error(t.playlists.removeSongError);
      } else {
        toast.success(t.playlists.removeSongSuccess);
      }
      setActiveMenu(null);
    } catch (error) {
      console.error(error);
      toast.error(t.playlists.removeSongError);
    }
  };

  const toggleMenu = (songId: string) => {
    setActiveMenu(activeMenu === songId ? null : songId);
  };

  if (displayedSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <Music className="w-12 h-12 mb-4 opacity-50" />
        <p>{t.library.noSongsFound}</p>
      </div>
    );
  }

  const isDragDisabled =
    sortBy !== "manual" || (playlistId !== "favorites" && !isAdmin);

  return (
    <div className="flex flex-col gap-2 pb-6 touch-manipulation">
      {(title || subtitle || showSortSelector) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-2">
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
            )}
            {subtitle && <p className="text-zinc-500 text-sm">{subtitle}</p>}
          </div>

          {showSortSelector && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {t.library.sort.label}
              </span>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortMode)}
              >
                <SelectTrigger
                  size="sm"
                  className="min-w-44 bg-zinc-800/80 border-zinc-700"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">
                    {t.library.sort.manual}
                  </SelectItem>
                  <SelectItem value="duration">
                    {t.library.sort.duration}
                  </SelectItem>
                  <SelectItem value="date-desc">
                    {t.library.sort.dateDesc}
                  </SelectItem>
                  <SelectItem value="date-asc">
                    {t.library.sort.dateAsc}
                  </SelectItem>
                  <SelectItem value="name">{t.library.sort.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Column Headers */}
      <div className="flex px-1 md:px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        {sortBy === "manual" && (isAdmin || playlistId === "favorites") && (
          <div className="w-10"></div>
        )}
        <div className="w-10 flex items-center justify-start">
          {t.library.headers.number}
        </div>
        <div className="flex-1 pr-4">{t.library.headers.title}</div>
        <div className="hidden sm:block flex-1 pr-4">
          {t.library.headers.artist}
        </div>
        <div className="w-16 flex justify-end">
          <Clock className="w-4 h-4" />
        </div>
        <div className="w-10"></div>
      </div>

      <DndContext
        id="song-list-dnd"
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
              dragDisabled={isDragDisabled}
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
        title={t.songMenu.deleteConfirmTitle}
        description={t.songMenu.deleteConfirmDescription}
        onConfirm={handleConfirmDelete}
        confirmText={t.common.delete}
        isDestructive={true}
      />
    </div>
  );
}
