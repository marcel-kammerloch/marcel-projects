import { getSongs } from "@/actions/song";
import SongList from "@/components/song/SongList";
import UploadModalBtn from "@/components/upload/UploadModalBtn";
import { Suspense } from "react";

export default async function Home() {
  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-2 md:px-4 mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Music Library
        </h1>
        <UploadModalBtn />
      </div>

      <div className="space-y-4">
        <Suspense fallback={<div>Loading</div>}>
          <Songs />
        </Suspense>
      </div>
    </main>
  );
}

async function Songs() {
    const { data: songs } = await getSongs();

    return (
      <SongList initialSongs={songs || []} />
    )
}