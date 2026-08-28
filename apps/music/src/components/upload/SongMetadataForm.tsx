"use client";

import type { Genre as GenreType } from "@db/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";

const GENRES: GenreType[] = [
  "FILM_SCORE",
  "PIANO",
  "CLASSICAL",
  "POP",
  "VIOLIN",
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
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label htmlFor="song-title" className="text-xs text-zinc-400 font-medium mb-1 block">
          {t.upload.titleLabel}
        </label>
        <input
          id="song-title"
          type="text"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          value={title || ""}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="song-artist" className="text-xs text-zinc-400 font-medium mb-1 block">
          {t.upload.artistLabel}
        </label>
        <input
          id="song-artist"
          type="text"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          value={artist || ""}
          onChange={(e) => setArtist(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 font-medium mb-1 block">
          {t.upload.genreLabel}
        </label>
        <Select value={genre} onValueChange={(value) => setGenre(value as GenreType)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GENRES.map((g) => (
              <SelectItem key={g} value={g}>
                {t.genres.names[g]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
