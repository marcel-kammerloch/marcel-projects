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
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto flex-1 min-w-0">
          <div className="w-24 h-24 shrink-0">
            <div className="w-full h-full aspect-square bg-zinc-900 rounded-2xl flex items-center justify-center relative overflow-hidden group border border-zinc-800">
              <div className="absolute inset-0 bg-linear-to-br from-rose-600/30 to-pink-900/40 opacity-80 group-hover:opacity-100 transition duration-300"></div>
              <Heart className="w-10 h-10 text-rose-400 fill-rose-500/30 group-hover:scale-110 transition relative z-10" />
              {favoriteSongs.length > 0 && (
                <button
                  type="button"
                  onClick={handlePlayFavorites}
                  className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition shadow-lg hover:scale-105 active:scale-95 z-20 cursor-pointer"
                  title="Play Favorites"
                >
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-rose-500 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-1">
              {t.favorites.badge}
            </p>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-bold text-white wrap-break-word">
                {t.favorites.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-zinc-400 text-xs sm:text-sm">
              <span>{t.common.songsCount(favoriteSongs.length)}</span>
            </div>
          </div>
        </div>
      </div>

      {favoriteSongs.length > 0 ? (
        <SongListBase
          songs={favoriteSongs}
          playlistId="favorites"
          title={t.favorites.title}
          playbackSourceType="playlist"
          playbackSourceName={t.favorites.title}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="p-4 bg-zinc-900 rounded-full mb-4 border border-zinc-800">
            <Heart className="w-10 h-10 text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-300 mb-1">
            {t.favorites.emptyTitle}
          </h3>
          <p className="text-zinc-500 text-sm max-w-sm">
            {t.favorites.emptyDescription}
          </p>
        </div>
      )}
    </>
  );
}
