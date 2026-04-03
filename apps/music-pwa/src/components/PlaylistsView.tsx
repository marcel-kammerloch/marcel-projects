"use client";

import { useState } from "react";
import type { Playlist, Song } from "@db/client";
import { createPlaylist } from "@/actions/playlist";
import {
  Play,
  ListMusic,
  Plus,
  Loader2,
  ArrowLeft,
  Clock,
  Music,
} from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

type PlaylistWithSongs = Playlist & { songs: Song[] };

export default function PlaylistsView({
  initialPlaylists,
}: {
  initialPlaylists: PlaylistWithSongs[];
}) {
  const [playlists, setPlaylists] = useState(initialPlaylists);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<PlaylistWithSongs | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { playSong } = usePlayerStore();

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

  const playPlaylist = (playlist: PlaylistWithSongs, startSong?: Song) => {
    if (playlist.songs.length === 0) return alert("Playlist is empty");
    const startIndex = startSong
      ? playlist.songs.findIndex((s) => s.id === startSong.id)
      : 0;
    const queue = playlist.songs.slice(startIndex >= 0 ? startIndex : 0);
    playSong(queue[0], playlist.songs);
  };

  if (selectedPlaylist) {
    return (
      <div className="flex flex-col gap-6 mt-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedPlaylist(null)}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {selectedPlaylist.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
              <span className="flex items-center gap-1">
                <Music className="w-3.5 h-3.5" />
                {selectedPlaylist.songs.length} songs
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Last updated:{" "}
                {selectedPlaylist.updatedAt
                  ? new Date(selectedPlaylist.updatedAt).toLocaleDateString()
                  : "Never"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => playPlaylist(selectedPlaylist)}
          className="bg-blue-600 hover:bg-blue-500 text-white w-fit px-6 py-2.5 rounded-full font-semibold transition flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
        >
          <Play className="w-5 h-5" fill="currentColor" />
          Play All
        </button>

        <div className="flex flex-col divide-y divide-zinc-800/50 mt-4">
          {selectedPlaylist.songs.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">
              This playlist is empty.
            </p>
          ) : (
            selectedPlaylist.songs.map((song, index) => (
              <div
                key={song.id}
                className="group flex items-center gap-4 py-3 px-2 hover:bg-zinc-800/50 transition cursor-pointer rounded-lg"
                onClick={() => playPlaylist(selectedPlaylist, song)}
              >
                <div className="w-8 text-zinc-500 text-sm text-center group-hover:hidden">
                  {index + 1}
                </div>
                <div className="w-8 hidden group-hover:flex items-center justify-center">
                  <Play className="w-4 h-4 text-blue-400" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {song.title}
                  </p>
                  <p className="text-zinc-500 text-sm truncate">
                    {song.artist || "Unknown Artist"}
                  </p>
                </div>
                <div className="text-zinc-500 text-sm tabular-nums">
                  {Math.floor(song.duration / 60)}:
                  {String(song.duration % 60).padStart(2, "0")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-blue-500" />
          Playlists
        </h2>
      </div>

      <form onSubmit={handleCreatePlaylist} className="flex gap-2">
        <input
          type="text"
          placeholder="New Playlist Name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
        />
        <button
          type="submit"
          disabled={isCreating || !newPlaylistName}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Create
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {playlists.length === 0 ? (
          <p className="text-zinc-500 text-sm col-span-full">
            No playlists created yet.
          </p>
        ) : (
          playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-zinc-800/50 hover:bg-zinc-800 transition rounded-xl p-4 flex flex-col group cursor-pointer border border-zinc-800"
              onClick={() => setSelectedPlaylist(playlist)}
            >
              <div className="w-full aspect-square bg-zinc-900 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-800/20 to-blue-800/20 opacity-50 group-hover:opacity-100 transition"></div>
                <ListMusic className="w-8 h-8 text-zinc-600 group-hover:text-blue-400 transition relative z-10" />
                <button
                  className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    playPlaylist(playlist);
                  }}
                >
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                </button>
              </div>
              <h3 className="font-semibold text-white truncate">
                {playlist.name}
              </h3>
              <p className="text-xs text-zinc-500">
                {playlist.songs.length} songs
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
