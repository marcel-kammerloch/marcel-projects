import { formatTime } from "@/utils/format-time";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: ProgressBarProps) {
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full flex items-center gap-3 text-xs font-medium text-zinc-400">
      <span className="min-w-[40px] text-right">{formatTime(currentTime)}</span>

      <div className="relative flex-1 group h-4 flex items-center">
        {/* Background track */}
        <div className="absolute w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div
            className="h-full bg-white transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Seek slider input */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Thumb (visible on hover or drag - simulated here nicely with the helper below) */}
        <div
          className="absolute h-3 w-3 bg-white rounded-full shadow pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
        />
      </div>

      <span className="min-w-[40px]">{formatTime(duration)}</span>
    </div>
  );
}
