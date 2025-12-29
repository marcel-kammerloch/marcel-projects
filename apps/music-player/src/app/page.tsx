import { Suspense } from "react";
import { MusicPlayer } from "@/components/music-player/player";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Suspense>
        <MusicPlayer />
      </Suspense>
    </main>
  );
}
