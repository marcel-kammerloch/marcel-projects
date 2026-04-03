import { getSongs } from "@/actions/song";
import { getPlaylists } from "@/actions/playlist";
import SongList from "@/components/SongList";
import PlaylistsView from "@/components/PlaylistsView";
import GenreView from "@/components/GenreView";
import UploadModalBtn from "@/components/UploadModalBtn";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: songs } = await getSongs();
  const { data: playlists } = await getPlaylists();

  return (
    <main className="flex-1 pb-24 w-full max-w-2xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Music Library
        </h1>
        <UploadModalBtn />
      </div>

      <div className="space-y-4">
        <SongList initialSongs={songs || []} />
      </div>

      <PlaylistsView initialPlaylists={playlists || []} />

      <GenreView allSongs={songs || []} />
    </main>
  );
}
