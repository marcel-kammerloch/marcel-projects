"use client";

import { useState } from "react";
import { Song } from "@prisma/client";
import { updateSong } from "@/actions/song";
import { Genre } from "@prisma/client";
import { X, Save, Music, Loader2 } from "lucide-react";

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
  const [genre, setGenre] = useState<Genre>(song.genre || Genre.POP);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setIsUpdating(true);

    try {
      await updateSong(song.id, { title, artist, genre });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update song");
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
            <Music className="w-5 h-5 text-blue-500" /> Edit Song
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">
              Title *
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
              Artist
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
              Genre
            </label>
            <select
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 appearance-none"
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
            >
              <option value={Genre.FILM_SCORE}>Film Score</option>
              <option value={Genre.PIANO}>Piano</option>
              <option value={Genre.CLASSICAL}>Classical</option>
              <option value={Genre.POP}>Pop</option>
              <option value={Genre.VIOLIN}>Violin</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
