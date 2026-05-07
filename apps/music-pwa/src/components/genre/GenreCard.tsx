"use client";

import Link from "next/link";
import type { Genre as GenreType } from "@db/client";
import {
  type LucideIcon,
  Clapperboard,
  Disc3,
  Guitar,
  Music,
  Piano,
} from "lucide-react";

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

const GENRE_ICONS: Record<GenreType, LucideIcon> = {
  FILM_SCORE: Clapperboard,
  PIANO: Piano,
  CLASSICAL: Disc3,
  POP: Music,
  VIOLIN: Guitar,
};

export default function GenreCard({
  genre,
  count,
}: {
  genre: GenreType;
  count: number;
}) {
  const Icon = GENRE_ICONS[genre];
  return (
    <Link
      href={`/genre/${genre.toLowerCase()}`}
      className={`flex p-4 rounded-xl border justify-between items-center transition hover:scale-[1.02] active:scale-[0.98] min-w-[140px] ${GENRE_COLORS[genre]}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-6 h-6" />
        <span className="font-bold text-lg">{GENRE_LABELS[genre]}</span>
      </div>
      <span className="text-sm opacity-70">{count} songs</span>
    </Link>
  );
}
