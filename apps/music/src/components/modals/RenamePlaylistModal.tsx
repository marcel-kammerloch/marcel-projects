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
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t.playlists.nameRequired);
      return;
    }

    setIsPending(true);
    try {
      const { error } = await renamePlaylist(playlistId, name.trim());
      if (error) throw new Error(error);

      toast.success(t.playlists.renameSuccess);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(t.playlists.renameError);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{t.playlists.renameTitle}</DialogTitle>
            <DialogDescription>
              {t.playlists.renameDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="playlist-name" className="sr-only">
              {t.playlists.renamePlaceholder}
            </label>
            <Input
              id="playlist-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.playlists.renamePlaceholder}
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
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? t.common.saving : t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
