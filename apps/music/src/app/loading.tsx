"use client";

import { Loader2, Music } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function Loading() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center p-6 bg-zinc-900/90 rounded-3xl shadow-2xl border border-zinc-800">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin absolute" />
        <Music className="w-5 h-5 text-zinc-300" />
      </div>
      <p className="mt-6 text-sm font-medium tracking-widest text-zinc-400 uppercase animate-pulse">
        {t.common.loading}
      </p>
    </div>
  );
}
