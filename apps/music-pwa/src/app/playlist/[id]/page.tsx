import { getPlaylist } from "@/actions/playlist";
import SongListBase from "@/components/song/SongListBase";
import BackButton from "@/components/BackButton";
import { notFound } from "next/navigation";
import DeletePlaylistButton from "@/components/playlist/DeletePlaylistButton";
import RenamePlaylistButton from "@/components/playlist/RenamePlaylistButton";
import AddSongButton from "@/components/playlist/AddSongButton";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";

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

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(playlist.createdAt));

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 mt-8">
      <BackButton />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 mt-2 w-full">
        {/* Cover Art and Metadata Container */}
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto flex-1 min-w-0">
          <div className="w-24 h-24">
            <PlaylistCard playlist={playlist} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-blue-500 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-1">
              Playlist
            </p>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white wrap-break-word">
                {playlist.name}
              </h1>
              <RenamePlaylistButton
                playlistId={id}
                initialName={playlist.name}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-zinc-400 text-xs sm:text-sm">
              <span>{playlist.songs.length} songs</span>
              <span>•</span>
              <span>Created {formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full sm:w-auto shrink-0 flex items-center gap-2 justify-start sm:justify-end mt-4 sm:mt-0">
          <AddSongButton
            playlistId={id}
            existingSongIds={playlist.songs.map((s) => s.id)}
          />
          <DeletePlaylistButton playlistId={id} />
        </div>
      </div>

      <SongListBase
        songs={playlist.songs}
        playlistId={id}
        title={playlist.name}
        playbackSourceType="playlist"
        playbackSourceName={playlist.name}
      />
    </main>
  );
}
