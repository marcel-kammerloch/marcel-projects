"use client";

import type { Song, Genre } from "@db/client";
import { Grid } from "lucide-react";
import GenreCard from "./GenreCard";

const GENRE_LABELS: Record<Genre, string> = {
  FILM_SCORE: "Film Score",
  PIANO: "Piano",
  CLASSICAL: "Classical",
  POP: "Pop",
  VIOLIN: "Violin",
};

export default function GenreView({ allSongs }: { allSongs: Song[] }) {
  return (
    <div className="flex flex-col gap-6 mt-12 pb-8">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-xl">
          <Grid className="w-5 h-5 text-blue-500" />
        </div>
        Explore Genres
      </h2>

      <div className="relative -mx-4">
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar snap-x scroll-smooth">
          {(Object.keys(GENRE_LABELS) as Genre[]).map((genre) => {
            const count = allSongs.filter((s) => s.genre === genre).length;
            return (
              <div key={genre} className="snap-start last:pr-4">
                <GenreCard genre={genre} count={count} />
              </div>
            );
          })}
          {/* Fading Edge */}
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-linear-to-l from-black to-transparent pointer-events-none opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
