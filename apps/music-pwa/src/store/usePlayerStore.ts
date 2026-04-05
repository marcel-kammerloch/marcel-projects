import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song } from "@db/client";

export type Settings = {
  skipDuration: number;
  loop: boolean;
  shuffle: boolean;
};

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isFullView: boolean;
  settings: Settings;

  // Actions
  setIsFullView: (isFullView: boolean) => void;
  setSettings: (settings: Partial<Settings>) => void;
  playSong: (song: Song, queue?: Song[]) => void;
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
      isPlaying: false,
      isFullView: false,
      settings: {
        skipDuration: 15,
        loop: false,
        shuffle: false,
      },

      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      playSong: (song, queue) =>
        set((state) => ({
          currentSong: song,
          isPlaying: true,
          queue: queue ?? state.queue,
        })),

      playNext: () => {
        const { currentSong, queue, settings } = get();
        if (!currentSong || queue.length === 0) return;

        if (settings.shuffle) {
          const randomIndex = Math.floor(Math.random() * queue.length);
          set({ currentSong: queue[randomIndex], isPlaying: true });
          return;
        }

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        if (currentIndex === -1) return;

        if (currentIndex === queue.length - 1) {
          if (settings.loop) {
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

        const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
        if (currentIndex <= 0) {
          set({ currentSong: queue[0], isPlaying: true });
        } else {
          set({ currentSong: queue[currentIndex - 1], isPlaying: true });
        }
      },

      setIsPlaying: (isPlaying) => set({ isPlaying }),

      setIsFullView: (isFullView) => set({ isFullView }),

      setQueue: (queue) => set({ queue }),
    }),
    {
      name: "music-player-storage",
      partialize: (state) => ({
        settings: state.settings,
        currentSong: state.currentSong,
        queue: state.queue,
      }),
    },
  ),
);
