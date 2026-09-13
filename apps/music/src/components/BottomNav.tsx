"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, ListMusic, Tags, Settings } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useTranslation } from "@/lib/i18n";

export default function BottomNav() {
  const pathname = usePathname();
  const { isFullView } = usePlayerStore();
  const { t } = useTranslation();

  if (isFullView) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 z-50 px-2 pb-safe">
      <div className="max-w-3xl mx-auto w-full flex items-center justify-around h-full">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition active:scale-95 ${
            pathname === "/"
              ? "text-blue-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Music className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium tracking-wide">
            {t.nav.songs}
          </span>
        </Link>

        <Link
          href="/playlists"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition active:scale-95 ${
            pathname === "/playlists" || pathname.startsWith("/playlist/")
              ? "text-blue-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ListMusic className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium tracking-wide">
            {t.nav.playlists}
          </span>
        </Link>

        <Link
          href="/genres"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition active:scale-95 ${
            pathname === "/genres" || pathname.startsWith("/genre/")
              ? "text-blue-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Tags className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium tracking-wide">
            {t.nav.genres}
          </span>
        </Link>

        <Link
          href="/settings"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition active:scale-95 ${
            pathname === "/settings"
              ? "text-blue-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-[10px] font-medium tracking-wide">
            {t.nav.settings}
          </span>
        </Link>
      </div>
    </div>
  );
}
