"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddSongModal } from "@/components/modals/AddSongModal";

interface AddSongButtonProps {
  playlistId: string;
  existingSongIds: string[];
}

export default function AddSongButton({
  playlistId,
  existingSongIds,
}: AddSongButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-xl transition flex items-center justify-center border border-blue-500/20 cursor-pointer"
        title="Add Song"
      >
        <Plus className="w-5 h-5 pointer-events-none" />
      </button>

      {isOpen && (
        <AddSongModal
          playlistId={playlistId}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          existingSongIds={existingSongIds}
        />
      )}
    </>
  );
}
