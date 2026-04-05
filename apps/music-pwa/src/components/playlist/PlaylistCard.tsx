"use client";

import Link from "next/link";
import type { Playlist, Song } from "@db/client";
import { ListMusic, Play } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

type PlaylistWithSongs = Playlist & { songs: Song[] };

export default function PlaylistCard({ playlist }: { playlist: PlaylistWithSongs }) {
  const { playSong } = usePlayerStore();

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className="bg-zinc-800/50 hover:bg-zinc-800 transition rounded-xl p-4 flex flex-col group cursor-pointer border border-zinc-800 min-w-[160px] sm:min-w-[200px]"
    >
      <div className="w-full aspect-square bg-zinc-900 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-800/20 to-blue-800/20 opacity-50 group-hover:opacity-100 transition"></div>
        <ListMusic className="w-8 h-8 text-zinc-600 group-hover:text-blue-400 transition relative z-10" />
        <button
          onClick={handlePlay}
          className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition shadow-lg hover:scale-105 active:scale-95"
        >
          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
        </button>
      </div>
      <h3 className="font-semibold text-white truncate">{playlist.name}</h3>
      <p className="text-xs text-zinc-500">{playlist.songs.length} songs</p>
    </Link>
  );
}
