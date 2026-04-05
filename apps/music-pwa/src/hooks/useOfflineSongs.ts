import { useState, useEffect } from "react";
import type { Song } from "@db/client";

export function useOfflineSongs(songs: Song[]) {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineSongs, setOfflineSongs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const checkOfflineCache = async () => {
      try {
        const cache = await caches.open("offline-songs");
        const keys = await cache.keys();
        const cachedUrls = new Set(keys.map((k) => k.url));
        const cachedIds = new Set(
          songs.filter((s) => cachedUrls.has(s.url)).map((s) => s.id)
        );
        setOfflineSongs(cachedIds);
      } catch (e) {
        console.error("Failed to check cache", e);
      }
    };
    checkOfflineCache();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [songs]);

  const handleToggleOffline = async (song: Song) => {
    try {
      const cache = await caches.open("offline-songs");
      const isCached = offlineSongs.has(song.id);

      const newOfflineSongs = new Set(offlineSongs);
      if (isCached) {
        await cache.delete(song.url);
        newOfflineSongs.delete(song.id);
      } else {
        newOfflineSongs.add(song.id);
        const response = await fetch(song.url);
        await cache.put(song.url, response);
      }
      setOfflineSongs(newOfflineSongs);
    } catch (error) {
      console.error("Offline toggle failed", error);
      alert("Failed to update offline status");
    }
  };

  return { isOnline, offlineSongs, handleToggleOffline };
}
