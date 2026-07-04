"use client";

import { useState } from "react";
import type { Song } from "@db/client";
import SongListBase from "./SongListBase";
import { SearchBar } from "@/components/ui/search-bar";

export default function SongList({ initialSongs }: { initialSongs: Song[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSongs = initialSongs.filter((song) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      song.title.toLowerCase().includes(q) ||
      (song.artist && song.artist.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      <SearchBar
        onSearch={setSearchTerm}
        placeholder="Search songs or artists..."
        className="mb-6"
      />
      {filteredSongs.length > 0 ? (
        <SongListBase songs={filteredSongs} />
      ) : (
        <div className="text-center py-12 text-zinc-500">
          No songs found for "{searchTerm}".
        </div>
      )}
    </div>
  );
}
