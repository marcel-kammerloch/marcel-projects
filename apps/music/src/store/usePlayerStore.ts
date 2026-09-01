import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song } from "@db/client";
import { audioEngine } from "@/lib/audio/audioEngine";

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
      ) => {
        if (typeof window !== "undefined") {
          audioEngine.playSong(
            song,
            queue ?? get().queue,
            playlistName,
            playbackSourceType,
            playbackSourceName,
          );
        } else {
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
          }));
        }
      },

      playNext: () => {
        if (typeof window !== "undefined") {
          audioEngine.next();
        }
      },

      playPrevious: () => {
        if (typeof window !== "undefined") {
          audioEngine.previous();
        }
      },

      setPlayOnlyThisSong: (playOnlyThisSong) => set({ playOnlyThisSong }),
      setIsPlaying: (isPlaying) => {
        if (typeof window !== "undefined") {
          if (isPlaying) {
            audioEngine.resume();
          } else {
            audioEngine.pause();
          }
        } else {
          set({ isPlaying });
        }
      },
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
