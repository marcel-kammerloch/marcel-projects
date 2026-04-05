"use client";

import { deletePlaylist } from "@/actions/playlist";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeletePlaylistButton({ playlistId }: { playlistId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this playlist? This action cannot be undone.")) {
      try {
        await deletePlaylist(playlistId);
        router.push("/playlists");
      } catch (error) {
        console.error(error);
        alert("Failed to delete playlist");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl transition flex items-center justify-center border border-red-500/20"
      title="Delete Playlist"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  );
}
