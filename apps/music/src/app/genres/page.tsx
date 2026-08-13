import { getSongs } from "@/actions/song";
import GenreView from "@/components/genre/GenreView";
import UploadModalBtn from "@/components/upload/UploadModalBtn";

export default async function GenresPage() {
  const { data: songs } = await getSongs();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Genres</h1>
        <UploadModalBtn />
      </div>

      <GenreView allSongs={songs || []} />
    </main>
  );
}
