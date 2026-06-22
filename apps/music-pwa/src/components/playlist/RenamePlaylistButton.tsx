"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { RenamePlaylistModal } from "@/components/modals/RenamePlaylistModal";

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
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-800/50 cursor-pointer"
        title="Rename Playlist"
      >
        <Edit2 className="w-5 h-5 pointer-events-none" />
      </button>

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
