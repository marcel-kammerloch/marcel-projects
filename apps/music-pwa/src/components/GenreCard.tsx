"use client";

import Link from "next/link";
import type { Song, Genre as GenreType } from "@db/client";
import { Music } from "lucide-react";

const GENRE_LABELS: Record<GenreType, string> = {
  FILM_SCORE: "Film Score",
  PIANO: "Piano",
  CLASSICAL: "Classical",
  POP: "Pop",
  VIOLIN: "Violin",
};

const GENRE_COLORS: Record<GenreType, string> = {
  FILM_SCORE: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  PIANO: "bg-amber-500/20 text-amber-400 border-amber-500/50",
  CLASSICAL: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
  POP: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  VIOLIN: "bg-rose-500/20 text-rose-400 border-rose-500/50",
};

export default function GenreCard({
  genre,
  count,
}: {
  genre: GenreType;
  count: number;
}) {
  return (
    <Link
      href={`/genre/${genre.toLowerCase()}`}
      className={`flex flex-col p-4 rounded-xl border text-left transition hover:scale-[1.02] active:scale-[0.98] min-w-[140px] ${GENRE_COLORS[genre]}`}
    >
      <Music className="w-6 h-6 mb-3" />
      <span className="font-bold text-lg">{GENRE_LABELS[genre]}</span>
      <span className="text-sm opacity-70">{count} songs</span>
    </Link>
  );
}
