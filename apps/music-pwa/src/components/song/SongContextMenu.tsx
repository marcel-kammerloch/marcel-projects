"use client";

import { useState, useEffect, useRef } from "react";
import type { Playlist, Song } from "@db/client";
import { getPlaylists } from "@/actions/playlist";
import { Trash2, Edit, ListPlus, Loader2 } from "lucide-react";

export interface SongMenuActions {
  onEdit: () => void;
  onDelete: () => void;
  onRemoveFromPlaylist?: () => void;
  onAddSongToPlaylist: (playlistId: string) => void;
}

interface SongContextMenuProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
  actions: SongMenuActions;
  openUpwards: boolean;
}

export default function SongContextMenu({
  isOpen,
  onClose,
  actions,
  openUpwards,
}: SongContextMenuProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        onClose();
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleShowPicker = async () => {
    setShowPicker(true);
    setLoading(true);
    try {
      const res = await getPlaylists();
      if (res.data) setPlaylists(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePickPlaylist = (plId: string) => {
    actions.onAddSongToPlaylist(plId);
    setShowPicker(false);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className={`absolute right-8 z-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 w-56 text-sm ${
        openUpwards ? "bottom-full mb-2" : "top-full mt-2"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {showPicker ? (
        <div className="flex flex-col">
          <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
            <span className="font-semibold text-zinc-400 text-xs">
              Choose Playlist
            </span>
            <button
              onClick={() => setShowPicker(false)}
              className="text-zinc-500 hover:text-white text-xs"
            >
              Back
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
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
                  onClick={() => handlePickPlaylist(pl.id)}
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
            onClick={() => {
              actions.onEdit();
              onClose();
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-3"
          >
            <Edit className="w-4 h-4" /> Edit Song
          </button>
          <button
            onClick={handleShowPicker}
            className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center gap-3"
          >
            <ListPlus className="w-4 h-4" /> Add to Playlist
          </button>
          {actions.onRemoveFromPlaylist && (
            <button
              onClick={() => {
                actions.onRemoveFromPlaylist!();
                onClose();
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-red-400 hover:text-red-300 transition flex items-center gap-3"
            >
              <Trash2 className="w-4 h-4" /> Remove from Playlist
            </button>
          )}
          <button
            onClick={() => {
              actions.onDelete();
              onClose();
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-red-400 hover:text-red-300 transition flex items-center gap-3"
          >
            <Trash2 className="w-4 h-4" /> Delete Song
          </button>
        </>
      )}
    </div>
  );
}
