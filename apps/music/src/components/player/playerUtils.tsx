import type { Song } from "@db/client";
import { STORAGE_URL } from "@/lib/constants";
import type { LoopMode } from "@/store/usePlayerStore";

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const getGradient = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const c1 = Math.abs(hash % 360);
  const c2 = (c1 + 40) % 360;

  return `linear-gradient(135deg, hsl(${c1}, 70%, 20%), hsl(${c2}, 70%, 10%))`;
};

export const getNextLoopMode = (loop: LoopMode): LoopMode => {
  if (loop === "off") return "once";
  if (loop === "once") return "repeat";
  return "off";
};

export const isStandalonePwa = () => {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean })?.standalone === true
  );
};

export const getSongSource = (song: Song) => `${STORAGE_URL}/${song.path}`;

export const MusicIcon = ({ className }: { className: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
)