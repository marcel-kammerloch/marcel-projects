import { getSongs } from "@/actions/song";
import SongList from "@/components/song/SongList";
import UploadModalBtn from "@/components/upload/UploadModalBtn";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: songs } = await getSongs();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Music Library
        </h1>
        <UploadModalBtn />
      </div>

      <div className="space-y-4">
        <SongList initialSongs={songs || []} />
      </div>
    </main>
  );
}
