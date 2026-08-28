import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FavoritesState {
  favoriteSongIds: string[];
  addFavorite: (songId: string) => void;
  removeFavorite: (songId: string) => void;
  toggleFavorite: (songId: string) => boolean;
  isFavorite: (songId: string) => boolean;
}

const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(name, value);
      }
    } catch {
      // Gracefully handle storage errors (e.g. quota exceeded or private mode)
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(name);
      }
    } catch {
      // Gracefully handle storage errors
    }
  },
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteSongIds: [],

      addFavorite: (songId: string) => {
        set((state) => {
          if (state.favoriteSongIds.includes(songId)) return state;
          return { favoriteSongIds: [...state.favoriteSongIds, songId] };
        });
      },

      removeFavorite: (songId: string) => {
        set((state) => ({
          favoriteSongIds: state.favoriteSongIds.filter((id) => id !== songId),
        }));
      },

      toggleFavorite: (songId: string) => {
        const { favoriteSongIds } = get();
        const exists = favoriteSongIds.includes(songId);
        if (exists) {
          set({
            favoriteSongIds: favoriteSongIds.filter((id) => id !== songId),
          });
          return false;
        } else {
          set({
            favoriteSongIds: [...favoriteSongIds, songId],
          });
          return true;
        }
      },

      isFavorite: (songId: string) => {
        return get().favoriteSongIds.includes(songId);
      },
    }),
    {
      name: "music-favorites-storage",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        favoriteSongIds: state.favoriteSongIds,
      }),
    },
  ),
);
