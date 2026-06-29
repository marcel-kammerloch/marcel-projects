"use client";

import type { Genre as GenreType } from "@db/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GENRE_OPTIONS: { value: GenreType; label: string }[] = [
  { value: "FILM_SCORE", label: "Film Score" },
  { value: "PIANO", label: "Piano" },
  { value: "CLASSICAL", label: "Classical" },
  { value: "POP", label: "Pop" },
  { value: "VIOLIN", label: "Violin" },
];

interface SongMetadataFormProps {
  title: string;
  setTitle: (value: string) => void;
  artist: string;
  setArtist: (value: string) => void;
  genre: GenreType;
  setGenre: (value: GenreType) => void;
}

export default function SongMetadataForm({
  title,
  setTitle,
  artist,
  setArtist,
  genre,
  setGenre,
}: SongMetadataFormProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label htmlFor="song-title" className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1 block">
          Title *
        </label>
        <input
          id="song-title"
          type="text"
          className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
          value={title || ""}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="song-artist" className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1 block">
          Artist
        </label>
        <input
          id="song-artist"
          type="text"
          className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
          value={artist || ""}
          onChange={(e) => setArtist(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-1 block">
          Genre
        </label>
        <Select value={genre} onValueChange={(value) => setGenre(value as GenreType)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GENRE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
