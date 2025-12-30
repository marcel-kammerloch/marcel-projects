import { Track } from "@/data/tracks";
import { Disc } from "lucide-react";

interface SongInfoProps {
  track: Track | null;
}

export function SongInfo({ track }: SongInfoProps) {
  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <Disc size={64} className="mb-4 opacity-20" />
        <p>No track selected</p>
      </div>
    );
  }

  // Generate a deterministic gradient based on track ID
  const getGradient = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c1 = Math.abs(hash % 360);
    const c2 = (c1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${c1}, 70%, 20%), hsl(${c2}, 70%, 10%))`;
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 h-full animate-in fade-in duration-500">
      <div
        className="w-64 h-64 rounded-2xl shadow-2xl mb-8 flex items-center justify-center transition-all duration-500 transform hover:scale-105"
        style={{ background: getGradient(track.id) }}
      >
        <Disc
          size={80}
          className="text-white/20 animate-[spin_10s_linear_infinite]"
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {track.title}
        </h2>
        <p className="text-zinc-400 text-lg">{track.artist}</p>
        <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-xs text-zinc-500 mt-2 border border-white/5">
          {track.genre}
        </span>
      </div>
    </div>
  );
}
