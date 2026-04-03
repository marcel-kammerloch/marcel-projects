"use client";

import { useState, useRef, useEffect } from "react";
import type { Song, Playlist } from "@db/client";
import { usePlayerStore } from "@/store/usePlayerStore";
import {
  Clock,
  Trash2,
  Edit,
  ListPlus,
  Loader2,
  Download,
  WifiOff,
  Music,
} from "lucide-react";
import { deleteSong } from "@/actions/song";
import { addSongToPlaylist, getPlaylists } from "@/actions/playlist";
import EditSongModal from "./EditSongModal";
import SongItem from "./SongItem";

interface SongListBaseProps {
  songs: Song[];
  title?: string;
  subtitle?: string;
}

export default function SongListBase({ songs, title, subtitle }: SongListBaseProps) {
  const { playSong } = usePlayerStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [playlists, setPlaylists] = useState<(Playlist & { songs: Song[] })[]>([]);
  const [showPlaylistPicker, setShowPlaylistPicker] = useState<string | null>(null);
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
    playSong(song, songs);
  };

  const handleDelete = async (songId: string) => {
    const song = songs.find((s) => s.id === songId);
    if (!song) return;

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

  const handleAddSongToPlaylist = async (playlistId: string, songId: string) => {
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

  const handleToggleOffline = async (songId: string) => {
    const song = songs.find((s) => s.id === songId);
    if (!song) return;

    try {
      const cache = await caches.open("offline-songs");
      const isCached = offlineSongs.has(song.id);

      if (isCached) {
        await cache.delete(song.url);
        offlineSongs.delete(song.id);
        setOfflineSongs(new Set(offlineSongs));
      } else {
        setOfflineSongs(new Set([...Array.from(offlineSongs), song.id]));
        const response = await fetch(song.url);
        await cache.put(song.url, response);
      }
      setActiveMenu(null);
    } catch (error) {
      console.error("Offline toggle failed", error);
      alert("Failed to update offline status");
    }
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

  const displayedSongs = isOnline
    ? songs
    : songs.filter((s) => offlineSongs.has(s.id));

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
            <p>No songs found.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-24">
      {(title || subtitle) && (
        <div className="mb-4 mt-4">
          {title && <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>}
          {subtitle && <p className="text-zinc-500 text-sm">{subtitle}</p>}
        </div>
      )}

      {/* Column Headers */}
      <div className="flex px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
        <div className="w-10"></div>
        <div className="flex-1">Title</div>
        <div className="hidden sm:block flex-1">Artist</div>
        <div className="w-16 flex justify-end">
          <Clock className="w-4 h-4" />
        </div>
        <div className="w-10"></div>
      </div>

      {displayedSongs.map((song, index) => (
        <SongItem
          key={song.id}
          song={song}
          index={index}
          isOffline={offlineSongs.has(song.id)}
          onPlay={handlePlay}
          onMenuClick={toggleMenu}
          activeMenuId={activeMenu}
        />
      ))}

      {/* Context Menu Tooltip */}
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
              <div className="max-h-60 pt-1">
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
                  setEditingSong(songs.find((s) => s.id === activeMenu) || null)
                }
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-3"
              >
                <Edit className="w-4 h-4" /> Edit Song
              </button>
              <button
                onClick={() => handleAddToPlaylistClick(activeMenu!)}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-3"
              >
                <ListPlus className="w-4 h-4" /> Add to Playlist
              </button>
              <button
                onClick={() => handleToggleOffline(activeMenu!)}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-3"
              >
                {offlineSongs.has(activeMenu!) ? (
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
                onClick={() => handleDelete(activeMenu!)}
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
