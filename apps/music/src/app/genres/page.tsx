import { getSongs } from "@/actions/song";
import UploadModalBtn from "@/components/upload/UploadModalBtn";
import { Genre } from "@db/index";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  type LucideIcon,
  Clapperboard,
  Disc3,
  Guitar,
  Music,
  Piano,
} from "lucide-react";

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

const GENRE_ICONS: Record<Genre, LucideIcon> = {
  FILM_SCORE: Clapperboard,
  PIANO: Piano,
  CLASSICAL: Disc3,
  POP: Music,
  VIOLIN: Guitar,
};

export default async function GenresPage() {
  const { data: songs } = await getSongs();

  if (!songs) return notFound();

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-2 md:px-4 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Genres</h1>
        <UploadModalBtn />
      </div>

      <div className="flex flex-col gap-6 mt-12 md:mt-16 pb-8">
        <div className="relative -mx-4">
          <div className="flex flex-col gap-5 px-4 pb-4">
            {(Object.keys(GENRE_LABELS) as Genre[]).map((genre) => {
              const count = songs.filter((s) => s.genre === genre).length;
              const Icon = GENRE_ICONS[genre];

              return (
                <Link
                  key={genre}
                  href={`/genre/${genre.toLowerCase()}`}
                  className={`flex p-4 rounded-xl border justify-between items-center transition hover:scale-[1.02] active:scale-[0.98] min-w-35 ${GENRE_COLORS[genre]}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-6 h-6" />
                    <span className="font-bold text-lg">
                      {GENRE_LABELS[genre]}
                    </span>
                  </div>
                  <span className="text-sm opacity-70">{count} songs</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
