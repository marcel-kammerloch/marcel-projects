import { useState } from "react";
import { Track } from "@/data/tracks";
import { Plus, Music, List, ArrowLeft, Trash2, Play } from "lucide-react";
import type { Playlist as PlaylistType } from "@/hooks/use-playlists";

interface LibraryProps {
  tracks: Track[];
  playlists: PlaylistType[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onTrackSelect: (track: Track, contextTracks?: Track[]) => void;
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: string) => void;
  onAddToPlaylist: (playlistId: string, trackId: string) => void;
  onRemoveFromPlaylist: (playlistId: string, trackId: string) => void;
  onPlayPlaylist?: (playlistId: string) => void;
}

export function Library({
  tracks,
  playlists,
  currentTrackId,
  isPlaying,
  onTrackSelect,
  onCreatePlaylist,
  onDeletePlaylist,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onPlayPlaylist,
}: LibraryProps) {
  const [view, setView] = useState<"tracks" | "playlists" | "playlist-detail">(
    "tracks"
  );
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [trackMenuId, setTrackMenuId] = useState<string | null>(null); // For "Add to playlist" menu

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  // Tracks to show: either all tracks or filtered by playlist
  const displayedTracks =
    view === "playlist-detail" && selectedPlaylist
      ? (selectedPlaylist.trackIds
          .map((id) => tracks.find((t) => t.id === id))
          .filter(Boolean) as Track[])
      : tracks;

  const handleTrackClick = (track: Track) => {
    // If in playlist detail view, we pass the context of "this playlist"
    if (view === "playlist-detail" && selectedPlaylist) {
      onTrackSelect(track, displayedTracks);
    } else {
      // Default context: all tracks
      onTrackSelect(track, tracks);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setShowCreateModal(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900/50 backdrop-blur-xl border-l border-zinc-800">
      {/* Header / Tabs */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {view === "playlist-detail" && selectedPlaylist ? (
              <button
                onClick={() => setView("playlists")}
                className="hover:bg-white/10 p-1 rounded-full mr-1"
              >
                <ArrowLeft size={20} />
              </button>
            ) : null}
            {view === "playlists"
              ? "Playlists"
              : view === "playlist-detail"
              ? selectedPlaylist?.name
              : "Library"}
          </h2>
          {view === "playlists" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <Plus size={20} />
            </button>
          )}
        </div>

        {view !== "playlist-detail" && (
          <div className="flex gap-2 p-1 bg-zinc-800/50 rounded-lg">
            <button
              onClick={() => setView("tracks")}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                view === "tracks"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Tracks
            </button>
            <button
              onClick={() => setView("playlists")}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                view === "playlists"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Playlists
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {view === "playlists" ? (
          <div className="space-y-1">
            {playlists.length === 0 ? (
              <div className="text-zinc-500 text-center py-8 text-sm">
                No playlists yet.
              </div>
            ) : (
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => {
                    setSelectedPlaylistId(playlist.id);
                    setView("playlist-detail");
                  }}
                  className="flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-white/5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center text-zinc-500">
                      <List size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{playlist.name}</div>
                      <div className="text-xs text-zinc-500">
                        {playlist.trackIds.length} tracks
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePlaylist(playlist.id);
                    }}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {view === "playlist-detail" && selectedPlaylist && (
              <div className="mb-4">
                <button
                  onClick={() => onPlayPlaylist?.(selectedPlaylist.id)}
                  className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                >
                  <Play size={20} fill="currentColor" />
                  Play Result
                </button>
              </div>
            )}

            {view === "playlist-detail" && displayedTracks.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-sm">
                This playlist is empty.
                <br />
                Go to tracks to add detailed songs.
              </div>
            )}
            {displayedTracks.map((track) => {
              const isCurrent = currentTrackId === track.id;

              return (
                <div
                  key={track.id}
                  className={`group flex items-center p-2 rounded-md hover:bg-white/5 transition-all w-full relative ${
                    isCurrent ? "bg-white/10" : ""
                  }`}
                >
                  {/* Play Click Area */}
                  <div
                    className="flex-1 flex items-center min-w-0 cursor-pointer"
                    onClick={() => handleTrackClick(track)}
                  >
                    <div className="w-8 flex justify-center items-center mr-3 text-zinc-400 group-hover:text-white">
                      {isCurrent && isPlaying ? (
                        <div className="flex gap-0.5 h-3 items-end">
                          <span className="w-1 bg-blue-500 animate-bounce h-2"></span>
                          <span className="w-1 bg-blue-500 animate-bounce delay-75 h-3"></span>
                          <span className="w-1 bg-blue-500 animate-bounce delay-150 h-1"></span>
                        </div>
                      ) : (
                        <Music size={14} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className={`truncate text-sm font-medium ${
                          isCurrent ? "text-blue-400" : "text-zinc-200"
                        }`}
                      >
                        {track.title}
                      </div>
                      <div className="truncate text-xs opacity-60 text-zinc-400">
                        {track.artist}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {view === "playlist-detail" && selectedPlaylist ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromPlaylist(selectedPlaylist.id, track.id);
                        }}
                        className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from playlist"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      // Add to Playlist Menu Trigger
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrackMenuId(
                              trackMenuId === track.id ? null : track.id
                            );
                          }}
                          className={`p-2 hover:text-white transition-colors text-zinc-500`}
                        >
                          <Plus size={16} />
                        </button>

                        {/* Context Menu */}
                        {trackMenuId === track.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setTrackMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl overflow-hidden z-50 py-1">
                              <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-700 mb-1">
                                Add to Playlist
                              </div>
                              {playlists.length > 0 ? (
                                playlists.map((p) => (
                                  <button
                                    key={p.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAddToPlaylist(p.id, track.id);
                                      setTrackMenuId(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2"
                                  >
                                    <List size={14} />
                                    <span className="truncate">{p.name}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-xs text-zinc-500 italic">
                                  No playlists
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setView("playlists");
                                  setTrackMenuId(null);
                                  setShowCreateModal(true);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-zinc-700 flex items-center gap-2 border-t border-zinc-700 mt-1"
                              >
                                <Plus size={14} />
                                <span>New playlist</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold">New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="My Awesome Mix"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
