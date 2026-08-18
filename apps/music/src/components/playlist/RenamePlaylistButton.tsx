"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { RenamePlaylistModal } from "@/components/modals/RenamePlaylistModal";
import ActionIconButton from "@/components/ui/ActionIconButton";

interface RenamePlaylistButtonProps {
  playlistId: string;
  initialName: string;
}

export default function RenamePlaylistButton({
  playlistId,
  initialName,
}: RenamePlaylistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ActionIconButton
        icon={Edit2}
        label="Rename Playlist"
        onClick={() => setIsOpen(true)}
      />

      {isOpen && (
        <RenamePlaylistModal
          playlistId={playlistId}
          initialName={initialName}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </>
  );
}
