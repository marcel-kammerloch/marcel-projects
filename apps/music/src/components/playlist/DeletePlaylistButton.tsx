"use client";

import { useState } from "react";
import { deletePlaylist } from "@/actions/playlist";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import ActionIconButton from "@/components/ui/ActionIconButton";
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
      <ActionIconButton
        icon={Trash2}
        label="Delete Playlist"
        onClick={() => setIsOpen(true)}
        variant="danger"
      />

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
