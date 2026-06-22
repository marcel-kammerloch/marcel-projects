"use client";

import { useState } from "react";
import { deletePlaylist } from "@/actions/playlist";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { toast } from "sonner";

export default function DeletePlaylistButton({
  playlistId,
}: {
  playlistId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deletePlaylist(playlistId);
      toast.success("Playlist deleted");
      router.push("/playlists");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete playlist");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl transition flex items-center justify-center border border-red-500/20 cursor-pointer"
        title="Delete Playlist"
      >
        <Trash2 className="w-5 h-5 pointer-events-none" />
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title="Delete Playlist"
        description="Are you sure you want to delete this playlist? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        isDestructive={true}
      />
    </>
  );
}
