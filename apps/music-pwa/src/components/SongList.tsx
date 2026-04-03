"use client";

import type { Song } from "@db/client";
import SongListBase from "./SongListBase";

export default function SongList({ initialSongs }: { initialSongs: Song[] }) {
  return <SongListBase songs={initialSongs} />;
}
