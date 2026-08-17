import { getGenreSongs } from "@/actions/genre";
import SongListBase from "@/components/song/SongListBase";
import BackButton from "@/components/BackButton";
import { notFound } from "next/navigation";
import type { Genre as GenreType } from "@db/client";
import {
  type LucideIcon,
  Clapperboard,
  Disc3,
  Guitar,
  Music,
  Piano,
} from "lucide-react";

const GENRE_LABELS: Record<string, string> = {
  film_score: "Film Score",
  piano: "Piano",
  classical: "Classical",
  pop: "Pop",
  violin: "Violin",
} as const;

const GENRE_COLORS: Record<string, string> = {
  film_score: "from-purple-600/20 to-purple-900/40 border-purple-500/20",
  piano: "from-amber-600/20 to-amber-900/40 border-amber-500/20",
  classical: "from-emerald-600/20 to-emerald-900/40 border-emerald-500/20",
  pop: "from-blue-600/20 to-blue-900/40 border-blue-500/20",
  violin: "from-rose-600/20 to-rose-900/40 border-rose-500/20",
};

const GENRE_ICONS: Record<GenreType, LucideIcon> = {
  FILM_SCORE: Clapperboard,
  PIANO: Piano,
  CLASSICAL: Disc3,
  POP: Music,
  VIOLIN: Guitar,
};

import { connection } from "next/server";

export default async function GenrePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  await connection();
  const { name } = await params;
  const genreKey = name.toLowerCase();

  if (!GENRE_LABELS[genreKey]) {
    notFound();
  }

  const genreEnum = genreKey.toUpperCase() as GenreType;
  const { data: genreSongs, error } = await getGenreSongs(genreEnum);

  if (error || !genreSongs) {
    return <div>Error loading songs</div>;
  }

  const Icon = GENRE_ICONS[genreEnum];

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 mt-8">
      <BackButton />

      <div
        className={`p-8 rounded-3xl mb-8 bg-linear-to-br ${GENRE_COLORS[genreKey]} border flex flex-col gap-4 relative overflow-hidden backdrop-blur-md shadow-2xl`}
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-1">
              Genre
            </p>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              {GENRE_LABELS[genreKey]}
            </h1>
          </div>
        </div>

        <p className="text-white/80 text-sm max-w-md relative z-10">
          Explore the best {GENRE_LABELS[genreKey]} tracks in your collection.
          There are {genreSongs.length} songs available in this genre.
        </p>

        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <SongListBase
        songs={genreSongs}
        genreKey={genreEnum}
        playbackSourceType="genre"
        playbackSourceName={GENRE_LABELS[genreKey]}
      />
    </main>
  );
}
