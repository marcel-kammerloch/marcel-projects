"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renamePlaylist } from "@/actions/playlist";
import { toast } from "sonner";

interface RenamePlaylistModalProps {
  playlistId: string;
  initialName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenamePlaylistModal({
  playlistId,
  initialName,
  isOpen,
  onOpenChange,
}: RenamePlaylistModalProps) {
  const [name, setName] = useState(initialName);
  const [isPending, setIsPending] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Playlist name cannot be empty");
      return;
    }

    setIsPending(true);
    try {
      const { error } = await renamePlaylist(playlistId, name.trim());
      if (error) throw new Error(error);

      toast.success("Playlist renamed successfully");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to rename playlist");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Rename Playlist</DialogTitle>
            <DialogDescription>
              Enter a new name for this playlist.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="playlist-name" className="sr-only">
              Playlist Name
            </label>
            <Input
              id="playlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playlist name"
              autoFocus
              required
            />
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
