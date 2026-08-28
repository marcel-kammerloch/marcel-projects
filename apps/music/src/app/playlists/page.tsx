import { getPlaylists } from "@/actions/playlist";
import { getSongs } from "@/actions/song";
import PlaylistsView from "@/components/playlist/PlaylistsView";
import UploadModalBtn from "@/components/upload/UploadModalBtn";
import { getTranslations } from "@/lib/i18n/server";

export default async function PlaylistsPage() {
  const [{ data: playlists }, { data: songs }, t] = await Promise.all([
    getPlaylists(),
    getSongs(),
    getTranslations(),
  ]);

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-2 md:px-4 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {t.playlists.title}
        </h1>
        <UploadModalBtn />
      </div>

      <PlaylistsView
        initialPlaylists={playlists || []}
        allSongs={songs || []}
      />
    </main>
  );
}
