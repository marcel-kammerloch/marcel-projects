"use client";

import { useState, useRef, useEffect } from "react";
import { Song, Playlist } from "@db/client";
import { usePlayerStore } from "@/store/usePlayerStore";
import {
  Play,
  MoreVertical,
  Music,
  Clock,
  Trash2,
  Edit,
  ListPlus,
  Loader2,
  Download,
  CheckCircle,
  WifiOff,
} from "lucide-react";
import { deleteSong } from "@/actions/song";
import { addSongToPlaylist, getPlaylists } from "@/actions/playlist";
import EditSongModal from "./EditSongModal";

export default function SongList({ initialSongs }: { initialSongs: Song[] }) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [playlists, setPlaylists] = useState<(Playlist & { songs: Song[] })[]>(
    [],
  );
  const [showPlaylistPicker, setShowPlaylistPicker] = useState<string | null>(
    null,
  );
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isOnline, setIsOnline] = useState(true);
  const [offlineSongs, setOfflineSongs] = useState<Set<string>>(new Set());

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check which songs are already offline
    const checkOfflineCache = async () => {
      try {
        const cache = await caches.open("offline-songs");
        const keys = await cache.keys();
        const cachedUrls = new Set(keys.map((k) => k.url));
        const cachedIds = new Set(
          initialSongs.filter((s) => cachedUrls.has(s.url)).map((s) => s.id),
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
  }, [initialSongs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setShowPlaylistPicker(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlay = (song: Song) => {
    playSong(song, initialSongs);
  };

  const handleDelete = async (song: Song) => {
    if (confirm(`Are you sure you want to delete "${song.title}"?`)) {
      try {
        await deleteSong(song.id);
        setActiveMenu(null);
      } catch (error) {
        console.error(error);
        alert("Failed to delete song");
      }
    }
  };

  const handleAddToPlaylistClick = async (songId: string) => {
    setShowPlaylistPicker(songId);
    setIsLoadingPlaylists(true);
    try {
      const res = await getPlaylists();
      if (res.data) {
        setPlaylists(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleAddSongToPlaylist = async (
    playlistId: string,
    songId: string,
  ) => {
    try {
      await addSongToPlaylist(playlistId, songId);
      setActiveMenu(null);
      setShowPlaylistPicker(null);
      alert("Added to playlist!");
    } catch (error) {
      console.error(error);
      alert("Failed to add to playlist");
    }
  };

  const handleToggleOffline = async (song: Song) => {
    try {
      const cache = await caches.open("offline-songs");
      const isCached = offlineSongs.has(song.id);

      if (isCached) {
        await cache.delete(song.url);
        offlineSongs.delete(song.id);
        setOfflineSongs(new Set(offlineSongs));
      } else {
        // Optimistically add to state
        setOfflineSongs(new Set([...Array.from(offlineSongs), song.id]));
        const response = await fetch(song.url);
        await cache.put(song.url, response);
      }
      setActiveMenu(null);
    } catch (error) {
      console.error("Offline toggle failed", error);
      alert("Failed to update offline status");
      // Revert state on error if needed
    }
  };

  const displayedSongs = isOnline
    ? initialSongs
    : initialSongs.filter((s) => offlineSongs.has(s.id));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const toggleMenu = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    if (activeMenu === songId) {
      setActiveMenu(null);
      setShowPlaylistPicker(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
      setActiveMenu(songId);
    }
  };

  if (displayedSongs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        {!isOnline ? (
          <>
            <WifiOff className="w-12 h-12 mb-4 opacity-50" />
            <p>You&apos;re offline. No songs available offline.</p>
          </>
        ) : (
          <>
            <Music className="w-12 h-12 mb-4 opacity-50" />
            <p>No songs found in your library.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-24">
      {!isOnline && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-lg text-xs flex items-center gap-2 mb-4">
          <WifiOff className="w-3.5 h-3.5" />
          Offline Mode: Showing only downloaded songs
        </div>
      )}
      <div className="flex px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        <div className="w-10"></div>
        <div className="flex-1">Title</div>
        <div className="hidden sm:block flex-1">Artist</div>
        <div className="w-16 flex justify-end">
          <Clock className="w-4 h-4" />
        </div>
        <div className="w-10"></div>
      </div>

      {displayedSongs.map((song, index) => {
        const isCurrent = currentSong?.id === song.id;
        const isOffline = offlineSongs.has(song.id);

        return (
          <div
            key={song.id}
            onClick={() => handlePlay(song)}
            className={`group flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors ${isCurrent ? "bg-blue-900/30 text-blue-400" : "hover:bg-zinc-800/50 text-zinc-300"}`}
          >
            <div className="w-10 flex items-center text-sm font-medium text-zinc-500 group-hover:text-blue-400">
              {isCurrent && isPlaying ? (
                <div className="flex items-end gap-[2px] h-4">
                  <div className="w-1 bg-blue-500 animate-[bounce_1s_infinite_0ms] h-full"></div>
                  <div className="w-1 bg-blue-500 animate-[bounce_1s_infinite_200ms] h-2/3"></div>
                  <div className="w-1 bg-blue-500 animate-[bounce_1s_infinite_400ms] h-full"></div>
                </div>
              ) : isCurrent ? (
                <span className="text-blue-500">{index + 1}</span>
              ) : (
                <span className="group-hover:hidden">{index + 1}</span>
              )}
              {(!isCurrent || (isCurrent && !isPlaying)) && (
                <Play
                  className={`w-4 h-4 fill-current hidden group-hover:block ${isCurrent ? "text-blue-500" : ""}`}
                />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <p
                  className={`text-base font-medium truncate ${isCurrent ? "text-white" : "group-hover:text-white"}`}
                >
                  {song.title}
                </p>
                {isOffline && (
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0" />
                )}
              </div>
              <p className="text-sm text-zinc-500 truncate sm:hidden">
                {song.artist || "Unknown"}
              </p>
            </div>

            <div className="hidden sm:block flex-1 min-w-0 text-sm text-zinc-500 pr-4 truncate">
              {song.artist || "Unknown Artist"}
            </div>

            <div className="w-16 flex justify-end text-sm text-zinc-500 tabular-nums">
              {formatTime(song.duration)}
            </div>

            <div className="w-10 flex justify-end relative">
              <button
                className={`p-2 hover:text-white transition-opacity focus:opacity-100 ${activeMenu === song.id ? "text-white" : "text-zinc-500 opacity-0 group-hover:opacity-100"}`}
                onClick={(e) => toggleMenu(e, song.id)}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}

      {activeMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 w-56 text-sm"
          style={{ top: menuPosition.top, right: menuPosition.right }}
        >
          {showPlaylistPicker ? (
            <div className="flex flex-col">
              <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                <span className="font-semibold text-zinc-400 text-xs">
                  Choose Playlist
                </span>
                <button
                  onClick={() => setShowPlaylistPicker(null)}
                  className="text-zinc-500 hover:text-white text-xs"
                >
                  Back
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto pt-1">
                {isLoadingPlaylists ? (
                  <div className="p-4 flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                ) : playlists.length === 0 ? (
                  <div className="px-4 py-3 text-zinc-500 italic">
                    No playlists found
                  </div>
                ) : (
                  playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() =>
                        handleAddSongToPlaylist(pl.id, showPlaylistPicker)
                      }
                      className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-3"
                    >
                      <ListPlus className="w-4 h-4" />
                      <span className="truncate">{pl.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() =>
                  setEditingSong(
                    initialSongs.find((s) => s.id === activeMenu) || null,
                  )
                }
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-3"
              >
                <Edit className="w-4 h-4" /> Edit Song
              </button>
              <button
                onClick={() => handleAddToPlaylistClick(activeMenu)}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-3"
              >
                <ListPlus className="w-4 h-4" /> Add to Playlist
              </button>
              <button
                onClick={() =>
                  handleToggleOffline(
                    initialSongs.find((s) => s.id === activeMenu)!,
                  )
                }
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-3"
              >
                {offlineSongs.has(activeMenu) ? (
                  <>
                    <Trash2 className="w-4 h-4" /> Remove from Offline
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Make Available Offline
                  </>
                )}
              </button>
              <div className="h-px bg-zinc-800 my-1 mx-2"></div>
              <button
                onClick={() =>
                  handleDelete(initialSongs.find((s) => s.id === activeMenu)!)
                }
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-red-400 hover:text-red-300 transition flex items-center gap-3"
              >
                <Trash2 className="w-4 h-4" /> Delete Song
              </button>
            </>
          )}
        </div>
      )}

      {editingSong && (
        <EditSongModal
          song={editingSong}
          isOpen={!!editingSong}
          onClose={() => {
            setEditingSong(null);
            setActiveMenu(null);
          }}
        />
      )}
    </div>
  );
}
