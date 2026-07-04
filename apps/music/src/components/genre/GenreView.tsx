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
        <div className="flex flex-col gap-5 px-4 pb-4">
          {(Object.keys(GENRE_LABELS) as Genre[]).map((genre) => {
            const count = allSongs.filter((s) => s.genre === genre).length;
            return <GenreCard key={genre} genre={genre} count={count} />;
          })}
        </div>
      </div>
    </div>
  );
}
