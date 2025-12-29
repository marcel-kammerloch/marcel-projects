import { useLocalStorage } from "./use-local-storage";

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useLocalStorage<Playlist[]>(
    "music-player-playlists",
    []
  );

  // We don't need activePlaylistId in local storage for this simple version,
  // but if we did, we'd use another useLocalStorage call.
  // For now, let's keep it in memory or manage it in the parent.
  // Actually the original hook exposed it but didn't persist it.

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      trackIds: [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    return newPlaylist.id;
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const addTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          if (p.trackIds.includes(trackId)) return p; // prevent duplicates
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      })
    );
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
        }
        return p;
      })
    );
  };

  const renamePlaylist = (playlistId: string, newName: string) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, name: newName } : p))
    );
  };

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    renamePlaylist,
  };
}
