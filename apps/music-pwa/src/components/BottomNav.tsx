"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, ListMusic, Tags, Settings } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function BottomNav() {
  const pathname = usePathname();
  const { isFullView } = usePlayerStore();

  if (isFullView) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around z-50 px-2 pb-safe">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
          pathname === "/"
            ? "text-blue-500"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <Music className="w-6 h-6" />
        <span className="text-[10px] font-medium tracking-wide">Songs</span>
      </Link>

      <Link
        href="/playlists"
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
          pathname === "/playlists" || pathname.startsWith("/playlist/")
            ? "text-blue-500"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <ListMusic className="w-6 h-6" />
        <span className="text-[10px] font-medium tracking-wide">Playlists</span>
      </Link>

      <Link
        href="/genres"
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
          pathname === "/genres" || pathname.startsWith("/genre/")
            ? "text-blue-500"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <Tags className="w-6 h-6" />
        <span className="text-[10px] font-medium tracking-wide">Genres</span>
      </Link>

      <Link
        href="/settings"
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition ${
          pathname === "/settings"
            ? "text-blue-500"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-medium tracking-wide">Settings</span>
      </Link>
    </div>
  );
}
