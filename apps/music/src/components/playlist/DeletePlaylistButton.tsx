"use client";

import { useState } from "react";
import { deletePlaylist } from "@/actions/playlist";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import ActionIconButton from "@/components/ui/ActionIconButton";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

export default function DeletePlaylistButton({
  playlistId,
}: {
  playlistId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const handleDelete = async () => {
    try {
      await deletePlaylist(playlistId);
      toast.success(t.playlists.deleteSuccess);
      router.push("/playlists");
    } catch (error) {
      console.error(error);
      toast.error(t.playlists.deleteError);
    }
  };

  return (
    <>
      <ActionIconButton
        icon={Trash2}
        label={t.playlists.deleteTitle}
        onClick={() => setIsOpen(true)}
        variant="danger"
      />

      <ConfirmModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={t.playlists.deleteTitle}
        description={t.playlists.deleteDescription}
        onConfirm={handleDelete}
        confirmText={t.common.delete}
        isDestructive={true}
      />
    </>
  );
}
