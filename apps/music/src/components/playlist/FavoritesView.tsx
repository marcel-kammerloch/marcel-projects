"use client";

import type { Song } from "@db/client";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useTranslation } from "@/lib/i18n";
import SongListBase from "@/components/song/SongListBase";
import { Heart, Play } from "lucide-react";

interface FavoritesViewProps {
  allSongs: Song[];
}

export default function FavoritesView({ allSongs }: FavoritesViewProps) {
  const { favoriteSongIds } = useFavoritesStore();
  const { playSong } = usePlayerStore();
  const { t } = useTranslation();

  const favoriteSongs = allSongs.filter((song) =>
    favoriteSongIds.includes(song.id),
  );

  const handlePlayFavorites = () => {
    if (favoriteSongs.length > 0) {
      playSong(
        favoriteSongs[0],
        favoriteSongs,
        t.favorites.title,
        "playlist",
        t.favorites.title,
      );
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 mt-2 w-full">
        {/* Cover Art and Metadata Container */}
        <div className="flex items-center gap-5 sm:gap-6 w-full sm:w-auto flex-1 min-w-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0">
            <div className="w-full h-full aspect-square bg-zinc-900 rounded-2xl flex items-center justify-center relative overflow-hidden group border border-zinc-800 shadow-xl shadow-rose-950/20">
              <div className="absolute inset-0 bg-linear-to-br from-rose-600/30 to-pink-900/40 opacity-80 group-hover:opacity-100 transition duration-300"></div>
              <Heart className="w-12 h-12 text-rose-400 fill-rose-500/30 group-hover:scale-110 transition relative z-10" />
              {favoriteSongs.length > 0 && (
                <button
                  type="button"
                  onClick={handlePlayFavorites}
                  className="absolute right-2.5 bottom-2.5 w-11 h-11 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition shadow-lg shadow-rose-950/50 hover:scale-105 active:scale-95 z-20 cursor-pointer"
                  title="Play Favorites"
                  aria-label="Play Favorites"
                >
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider mb-2">
              {t.favorites.badge}
            </span>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight wrap-break-word">
                {t.favorites.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-zinc-400 text-xs sm:text-sm font-medium">
              <span>{t.common.songsCount(favoriteSongs.length)}</span>
            </div>
          </div>
        </div>
      </div>

      {favoriteSongs.length > 0 ? (
        <SongListBase
          songs={favoriteSongs}
          playlistId="favorites"
          playbackSourceType="playlist"
          playbackSourceName={t.favorites.title}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 my-6">
          <div className="p-5 bg-zinc-900/90 rounded-full mb-4 border border-zinc-800 shadow-inner">
            <Heart className="w-10 h-10 text-rose-500/40" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-1">
            {t.favorites.emptyTitle}
          </h3>
          <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
            {t.favorites.emptyDescription}
          </p>
        </div>
      )}
    </>
  );
}
