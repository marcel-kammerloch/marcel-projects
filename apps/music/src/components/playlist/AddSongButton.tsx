"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddSongModal } from "@/components/modals/AddSongModal";
import ActionIconButton from "@/components/ui/ActionIconButton";
import { useTranslation } from "@/lib/i18n";

interface AddSongButtonProps {
  playlistId: string;
  existingSongIds: string[];
}

export default function AddSongButton({
  playlistId,
  existingSongIds,
}: AddSongButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <ActionIconButton
        icon={Plus}
        label={t.playlists.addSongTitle}
        onClick={() => setIsOpen(true)}
        variant="primary"
      />

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
