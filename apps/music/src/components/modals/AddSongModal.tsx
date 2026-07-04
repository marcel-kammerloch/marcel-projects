"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addSongToPlaylist } from "@/actions/playlist";
import { getSongs } from "@/actions/song";
import type { Song } from "@db/client";
import { Plus, Loader2 } from "lucide-react";

interface AddSongModalProps {
  playlistId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  existingSongIds: string[];
}

export function AddSongModal({
  playlistId,
  isOpen,
  onOpenChange,
  existingSongIds,
}: AddSongModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [songs, setSongs] = useState<Pick<Song, "id" | "title" | "artist">[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [addingSongId, setAddingSongId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && songs.length === 0) {
      setIsLoading(true);
      getSongs({ min: true }).then((res) => {
        if (res.data) setSongs(res.data);
        setIsLoading(false);
      });
    }
  }, [isOpen, songs.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddSong = async (songId: string) => {
    if (existingSongIds.includes(songId)) {
      toast.error("Song is already in the playlist");
      return;
    }
    setAddingSongId(songId);
    try {
      const { error } = await addSongToPlaylist(playlistId, songId);
      if (error) throw new Error(error);
      toast.success("Song added to playlist");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add song");
    } finally {
      setAddingSongId(null);
    }
  };

  const searchResults = songs
    .filter((song) => {
      const q = debouncedSearch.toLowerCase();
      return (
        song.title.toLowerCase().includes(q) ||
        (song.artist && song.artist.toLowerCase().includes(q))
      );
    })
    .filter((song) => !existingSongIds.includes(song.id))
    .slice(0, 5);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Add Song to Playlist</DialogTitle>
          <DialogDescription>
            Search your library to add a song to this playlist.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or artist..."
            autoFocus
          />

          <div className="min-h-50">
            {isLoading && (
              <div className="flex justify-center items-center py-8 text-zinc-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            {!isLoading && debouncedSearch && searchResults.length === 0 && (
              <p className="text-sm text-center py-8 text-zinc-500">
                No songs found.
              </p>
            )}

            {!isLoading && searchResults.length > 0 && (
              <ul className="space-y-2">
                {searchResults.map((song) => (
                  <li
                    key={song.id}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition cursor-pointer"
                    onClick={() => handleAddSong(song.id)}
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-zinc-900 dark:text-white truncate">
                        {song.title}
                      </span>
                      <span className="text-sm text-zinc-500 truncate">
                        {song.artist || "Unknown Artist"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={addingSongId === song.id}
                    >
                      {addingSongId === song.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {!isLoading && !debouncedSearch && (
              <p className="text-sm text-center py-8 text-zinc-500">
                Type to start searching
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
