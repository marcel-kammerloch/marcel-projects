"use client";

import { useState } from "react";
import { Song, Genre } from "@prisma/client";
import { Music, Play, ArrowLeft, Grid } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

const GENRE_LABELS: Record<Genre, string> = {
  FILM_SCORE: "Film Score",
  PIANO: "Piano",
  CLASSICAL: "Classical",
  POP: "Pop",
  VIOLIN: "Violin",
};

const GENRE_COLORS: Record<Genre, string> = {
  FILM_SCORE: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  PIANO: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  CLASSICAL: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  POP: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  VIOLIN: "bg-rose-500/20 text-rose-400 border-rose-500/50",
};

export default function GenreView({ allSongs }: { allSongs: Song[] }) {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const { playSong } = usePlayerStore();

  const genreSongs = selectedGenre ? allSongs.filter((s) => s.genre === selectedGenre) : [];

  const handlePlayGenre = (songs: Song[], startSong?: Song) => {
    if (songs.length === 0) return;
    const startIndex = startSong ? songs.findIndex(s => s.id === startSong.id) : 0;
    const queue = songs.slice(startIndex >= 0 ? startIndex : 0);
    playSong(queue[0], songs);
  };

  if (selectedGenre) {
    return (
      <div className="flex flex-col gap-6 mt-12 pb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedGenre(null)}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{GENRE_LABELS[selectedGenre]}</h2>
            <p className="text-zinc-500 text-sm mt-1">{genreSongs.length} songs in this genre</p>
          </div>
        </div>

        <button
          onClick={() => handlePlayGenre(genreSongs)}
          disabled={genreSongs.length === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white w-fit px-6 py-2.5 rounded-full font-semibold transition flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
        >
          <Play className="w-5 h-5" fill="currentColor" />
          Play All
        </button>

        <div className="flex flex-col divide-y divide-zinc-800/50">
          {genreSongs.length === 0 ? (
            <p className="text-zinc-500 text-center py-12">No songs in this genre yet.</p>
          ) : (
            genreSongs.map((song, index) => (
              <div
                key={song.id}
                className="group flex items-center gap-4 py-3 px-2 hover:bg-zinc-800/50 transition cursor-pointer rounded-lg"
                onClick={() => handlePlayGenre(genreSongs, song)}
              >
                <div className="w-8 text-zinc-500 text-sm text-center group-hover:hidden">
                  {index + 1}
                </div>
                <div className="w-8 hidden group-hover:flex items-center justify-center">
                  <Play className="w-4 h-4 text-blue-400" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{song.title}</p>
                  <p className="text-zinc-500 text-sm truncate">{song.artist || "Unknown Artist"}</p>
                </div>
                <div className="text-zinc-500 text-sm tabular-nums">
                  {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, "0")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-12 pb-8">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Grid className="w-5 h-5 text-blue-500" />
        Explore Genres
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(Object.keys(GENRE_LABELS) as Genre[]).map((genre) => {
          const count = allSongs.filter((s) => s.genre === genre).length;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`flex flex-col p-4 rounded-xl border text-left transition hover:scale-[1.02] active:scale-[0.98] ${GENRE_COLORS[genre]}`}
            >
              <Music className="w-6 h-6 mb-3" />
              <span className="font-bold text-lg">{GENRE_LABELS[genre]}</span>
              <span className="text-sm opacity-70">{count} songs</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
