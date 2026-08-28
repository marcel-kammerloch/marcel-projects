"use client";

import { useState } from "react";
import type { Playlist, Song } from "@db/client";
import { createPlaylist } from "@/actions/playlist";
import { Plus, Loader2 } from "lucide-react";
import PlaylistCardLink, { FavoritesCardLink } from "./PlaylistCard";
import AdminOnly from "../AdminOnly";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";

type PlaylistWithSongs = Playlist & { songs: Song[] };

export default function PlaylistsView({
  initialPlaylists,
  allSongs = [],
}: {
  initialPlaylists: PlaylistWithSongs[];
  allSongs?: Song[];
}) {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { t } = useTranslation();

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      toast.error(t.playlists.nameRequired);
      return;
    }
    setIsCreating(true);

    try {
      const res = await createPlaylist(newPlaylistName.trim());
      if (res.data) {
        setPlaylists([{ ...res.data, songs: [] }, ...playlists]);
        setNewPlaylistName("");
        toast.success(t.playlists.createSuccess);
      } else if (res.error) {
        toast.error(t.playlists.createError);
      }
    } catch (error) {
      console.error(error);
      toast.error(t.playlists.createError);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-12 pb-8">
      <AdminOnly>
        <form onSubmit={handleCreatePlaylist} className="flex gap-2">
          <input
            type="text"
            placeholder={t.playlists.newPlaylistPlaceholder}
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 text-sm transition-all focus:ring-4 focus:ring-blue-500/10"
          />
          <button
            type="submit"
            disabled={isCreating || !newPlaylistName.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg hover:shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {t.playlists.createButton}
          </button>
        </form>
      </AdminOnly>

      <div className="relative -mx-4">
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar snap-x scroll-smooth">
          {/* Favorites Special Playlist Card always shown */}
          <div className="snap-start">
            <FavoritesCardLink allSongs={allSongs} />
          </div>

          {playlists.map((playlist) => (
            <div key={playlist.id} className="snap-start last:pr-4">
              <PlaylistCardLink playlist={playlist} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
