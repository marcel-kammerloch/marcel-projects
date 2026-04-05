import { getPlaylist } from "@/actions/playlist";
import SongListBase from "@/components/song/SongListBase";
import BackButton from "@/components/BackButton";
import { notFound } from "next/navigation";
import { ListMusic, Play } from "lucide-react";
import DeletePlaylistButton from "@/components/playlist/DeletePlaylistButton";

export const dynamic = "force-dynamic";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: playlist, error } = await getPlaylist(id);

  if (error || !playlist) {
    notFound();
  }

  return (
    <main className="flex-1 pb-24 w-full max-w-2xl mx-auto px-4 mt-8">
      <BackButton />

      <div className="flex items-center gap-6 mb-8 mt-2">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden relative group">
          <ListMusic className="w-12 h-12 text-zinc-600 group-hover:text-blue-500 transition" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/40 to-transparent"></div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-blue-500 font-semibold text-sm uppercase tracking-wider mb-1">
            Playlist
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 truncate">
            {playlist.name}
          </h1>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <span>{playlist.songs.length} songs</span>
            <span>•</span>
            <span>
              Created {new Date(playlist.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <DeletePlaylistButton playlistId={id} />
        </div>
      </div>

      <SongListBase songs={playlist.songs} playlistId={id} />
    </main>
  );
}
