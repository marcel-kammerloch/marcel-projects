"use client";

import { useState } from "react";
import type { Playlist, Song } from "@db/client";
import { createPlaylist } from "@/actions/playlist";
import { ListMusic, Plus, Loader2 } from "lucide-react";
import PlaylistCardLink from "./PlaylistCard";

type PlaylistWithSongs = Playlist & { songs: Song[] };

export default function PlaylistsView({
  initialPlaylists,
}: {
  initialPlaylists: PlaylistWithSongs[];
}) {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName) return;
    setIsCreating(true);

    try {
      const res = await createPlaylist(newPlaylistName);
      if (res.data) {
        setPlaylists([{ ...res.data, songs: [] }, ...playlists]);
        setNewPlaylistName("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-12 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <ListMusic className="w-5 h-5 text-blue-500" />
          </div>
          Your Playlists
        </h2>
      </div>

      <form onSubmit={handleCreatePlaylist} className="flex gap-2">
        <input
          type="text"
          placeholder="New Playlist Name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 text-sm transition-all focus:ring-4 focus:ring-blue-500/10"
        />
        <button
          type="submit"
          disabled={isCreating || !newPlaylistName}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg hover:shadow-blue-500/20 active:scale-95"
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Create
        </button>
      </form>

      <div className="relative -mx-4">
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar snap-x scroll-smooth">
          {playlists.length === 0 ? (
            <p className="text-zinc-500 text-sm py-4 italic">
              No playlists created yet. Start by creating one above!
            </p>
          ) : (
            playlists.map((playlist) => (
              <div key={playlist.id} className="snap-start last:pr-4">
                <PlaylistCardLink playlist={playlist} />
              </div>
            ))
          )}
          {/* Fading Edge */}
          {/* <div className="absolute right-0 top-0 bottom-4 w-12 bg-linear-to-l from-black to-transparent pointer-events-none opacity-50"></div> */}
        </div>
      </div>
    </div>
  );
}
