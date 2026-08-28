"use client";

import { useState } from "react";
import { updateSong } from "@/actions/song";
import { X, Save, Music, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

const Genre = {
  FILM_SCORE: "FILM_SCORE",
  PIANO: "PIANO",
  CLASSICAL: "CLASSICAL",
  POP: "POP",
  VIOLIN: "VIOLIN",
} as const;
type Genre = (typeof Genre)[keyof typeof Genre];

type Song = {
  id: string;
  title: string;
  artist: string | null;
  genre: Genre;
  duration: number;
  path: string;
  createdAt: Date;
  speed?: number;
};

export default function EditSongModal({
  song,
  isOpen,
  onClose,
}: {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist || "");
  const [genre, setGenre] = useState<Genre>(song.genre || "POP");
  const [speed, setSpeed] = useState(
    song.speed !== undefined ? song.speed.toFixed(2) : "1.00",
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const speedNum = parseFloat(speed);
    if (isNaN(speedNum) || speedNum < 0.5 || speedNum > 1.5) {
      toast.error(t.editSong.speedRangeError);
      return;
    }
    if (Number(speedNum.toFixed(2)) !== speedNum) {
      toast.error(t.editSong.speedDecimalsError);
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await updateSong(song.id, {
        title,
        artist,
        genre,
        speed: speedNum,
      });

      if (error) {
        toast.error(t.editSong.updateError);
      } else {
        toast.success(t.editSong.updateSuccess);
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(t.editSong.updateError);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-800">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Music className="w-5 h-5 text-blue-500" /> {t.editSong.title}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">
              {t.editSong.titleLabel}
            </label>
            <input
              type="text"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">
              {t.editSong.artistLabel}
            </label>
            <input
              type="text"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">
              {t.editSong.genreLabel}
            </label>
            <select
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
            >
              <option value={Genre.FILM_SCORE}>
                {t.genres.names.FILM_SCORE}
              </option>
              <option value={Genre.PIANO}>{t.genres.names.PIANO}</option>
              <option value={Genre.CLASSICAL}>
                {t.genres.names.CLASSICAL}
              </option>
              <option value={Genre.POP}>{t.genres.names.POP}</option>
              <option value={Genre.VIOLIN}>{t.genres.names.VIOLIN}</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">
              {t.editSong.speedLabel}
            </label>
            <input
              type="number"
              min="0.50"
              max="1.50"
              step="0.05"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-lg transition cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.common.saving}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t.editSong.saveChanges}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
