import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song } from "@db/client";
import { useSettingsStore } from "./useSettingsStore";

export type LoopMode = "off" | "once" | "repeat";

export type Settings = {
  skipDuration: number;
  loop: LoopMode;
  shuffle: boolean;
  highContrast: boolean;
  keepScreenOn: boolean;
  reduceDynamicRange: boolean;
  saveBattery: boolean;
  reduceAnimations: boolean;
};

const normalizeLoopMode = (value: unknown): LoopMode => {
  if (value === "once" || value === "repeat") return value;
  return "off";
};

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  playlistName: string | null;
  playbackSourceType: "playlist" | "genre" | null;
  playbackSourceName: string | null;
  isPlaying: boolean;
  isFullView: boolean;
  playOnlyThisSong: boolean;

  // Actions
  setIsFullView: (isFullView: boolean) => void;
  setPlayOnlyThisSong: (playOnlyThisSong: boolean) => void;
  playSong: (
    song: Song,
    queue?: Song[],
    playlistName?: string | null,
    playbackSourceType?: "playlist" | "genre" | null,
    playbackSourceName?: string | null,
  ) => void;
  playNext: () => void;
  playPrevious: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setQueue: (queue: Song[]) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      queue: [],
      playlistName: null,
      playbackSourceType: null,
      playbackSourceName: null,
      isPlaying: false,
      isFullView: false,
      playOnlyThisSong: false,

      playSong: (
        song,
        queue,
        playlistName = null,
        playbackSourceType = null,
        playbackSourceName = null,
      ) =>
        set((state) => ({
          currentSong: song,
          isPlaying: true,
          playOnlyThisSong: false,
          queue: queue ?? state.queue,
          playlistName:
            playlistName !== undefined ? playlistName : state.playlistName,
          playbackSourceType:
            playbackSourceType !== undefined
              ? playbackSourceType
              : state.playbackSourceType,
          playbackSourceName:
            playbackSourceName !== undefined
              ? playbackSourceName
              : state.playbackSourceName,
        })),

      playNext: () => {
        const { currentSong, queue } = get();
        const { settings } = useSettingsStore.getState();

        if (!currentSong || queue.length === 0) return;

        set({ playOnlyThisSong: false });

        if (settings.shuffle) {
          const randomIndex = Math.floor(Math.random() * queue.length);
          set({ currentSong: queue[randomIndex], isPlaying: true });
          return;
        }

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        if (currentIndex === -1) return;

        if (currentIndex === queue.length - 1) {
          if (settings.loop === "repeat") {
            set({ currentSong: queue[0], isPlaying: true });
          } else {
            set({ isPlaying: false });
          }
        } else {
          set({ currentSong: queue[currentIndex + 1], isPlaying: true });
        }
      },

      playPrevious: () => {
        const { currentSong, queue } = get();
        if (!currentSong || queue.length === 0) return;

        set({ playOnlyThisSong: false });

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        if (currentIndex <= 0) {
          set({ currentSong: queue[0], isPlaying: true });
        } else {
          set({ currentSong: queue[currentIndex - 1], isPlaying: true });
        }
      },

      setPlayOnlyThisSong: (playOnlyThisSong) => set({ playOnlyThisSong }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setIsFullView: (isFullView) => set({ isFullView }),
      setQueue: (queue) => set({ queue }),
    }),
    {
      name: "music-player-storage",
      partialize: (state) => ({
        currentSong: state.currentSong,
        queue: state.queue,
        playlistName: state.playlistName,
        playbackSourceType: state.playbackSourceType,
        playbackSourceName: state.playbackSourceName,
      }),
    },
  ),
);
