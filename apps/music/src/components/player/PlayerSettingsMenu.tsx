import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gauge, Volume2, Disc3, Menu as MenuIcon } from "lucide-react";

import { Slider } from "@/components/ui/slider";

interface PlayerSettingsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playbackRate: number;
  volume: number;
  playOnlyThisSong: boolean;
  onPlaybackRateChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onTogglePlayOnlyThisSong: () => void;
}

export default function PlayerSettingsMenu({
  open,
  onOpenChange,
  playbackRate,
  volume,
  playOnlyThisSong,
  onPlaybackRateChange,
  onVolumeChange,
  onTogglePlayOnlyThisSong,
}: PlayerSettingsMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={(props, state) => (
          <button
            {...props}
            disabled={state.disabled}
            className="text-white p-2 hover:bg-zinc-800 rounded-full transition"
            type="button"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        )}
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Player Settings</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-zinc-500">
                <Gauge className="w-4 h-4" />
                <span>Speed</span>
              </div>
              <span className="font-medium">{playbackRate.toFixed(2)}x</span>
            </div>
            <Slider
              value={[playbackRate]}
              min={0.5}
              max={1.5}
              step={0.05}
              onValueChange={(value) =>
                onPlaybackRateChange(Number(Array.isArray(value) ? value[0] : value))
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-zinc-500">
                <Volume2 className="w-4 h-4" />
                <span>Volume</span>
              </div>
              <span className="font-medium">{Math.round(volume * 100)}%</span>
            </div>
            <Slider
              value={[volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(value) =>
                onVolumeChange(Number(Array.isArray(value) ? value[0] : value))
              }
            />
          </div>

          <DropdownMenuSeparator />
          <button
            type="button"
            onClick={onTogglePlayOnlyThisSong}
            className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs font-medium transition ${
              playOnlyThisSong
                ? "bg-blue-950/40 text-blue-400 font-semibold"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <Disc3 className="w-4 h-4" />
              Play only this song
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                playOnlyThisSong
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-zinc-400"
              }`}
            >
              {playOnlyThisSong ? "ON" : "OFF"}
            </span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
