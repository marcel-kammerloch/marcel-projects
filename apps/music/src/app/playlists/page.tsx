import { getPlaylists } from "@/actions/playlist";
import PlaylistsView from "@/components/playlist/PlaylistsView";
import UploadModalBtn from "@/components/upload/UploadModalBtn";

export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
  const { data: playlists } = await getPlaylists();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Playlists
        </h1>
        <UploadModalBtn />
      </div>

      <PlaylistsView initialPlaylists={playlists || []} />
    </main>
  );
}
