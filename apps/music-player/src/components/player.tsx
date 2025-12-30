"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TRACKS, type Track } from "@/data/tracks";
import { PlayerControls } from "./controls";
import { ProgressBar } from "./progress-bar";
import { SongInfo } from "./song-info";
import { Library } from "./library";
import { usePlaylists } from "@/hooks/use-playlists";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ChevronDown, Music } from "lucide-react";

export function MusicPlayer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // -- State: Queue Management --
  // We maintain a "queue" of tracks that the player is currently iterating through.
  // By default, this is all tracks. When playing from playlist, it changes.
  const [queue, setQueue] = useState<Track[]>(TRACKS);
  const [originalQueue, setOriginalQueue] = useState<Track[]>(TRACKS); // To restore after shuffle

  // -- State: Playback --
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // -- State: Persistence --
  const [isShuffle, setIsShuffle] = useLocalStorage<boolean>(
    "music-player:shuffle",
    false
  );
  const [isRepeat, setIsRepeat] = useLocalStorage<boolean>(
    "music-player:repeat",
    false
  );

  // -- State: UI --
  const [showFullPlayerMobile, setShowFullPlayerMobile] = useState(false); // New: for bottom sheet player

  // -- Hooks --
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  } = usePlaylists();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = queue[currentTrackIndex] || TRACKS[0];

  // -- URL Sync --
  // 1. On mount, check URL for track to load
  useEffect(() => {
    const trackIdFromUrl = searchParams.get("track");
    if (trackIdFromUrl) {
      // Find in global tracks first as we are initializing
      const index = TRACKS.findIndex((t) => t.id === trackIdFromUrl);
      if (index !== -1) {
        // Init default queue with this track selected
        setCurrentTrackIndex(index);
      }
    }
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Sync active track to URL (Only after initialization)
  useEffect(() => {
    if (isInitialized && currentTrack) {
      const params = new URLSearchParams(window.location.search);
      if (params.get("track") !== currentTrack.id) {
        params.set("track", currentTrack.id);
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }
  }, [currentTrack, router, isInitialized]);

  // -- Audio Element Management --
  // Handle source change
  useEffect(() => {
    if (audioRef.current) {
      const isSrcChanged = !audioRef.current.src.includes(currentTrack.src);
      if (isSrcChanged) {
        audioRef.current.src = currentTrack.src;
        audioRef.current.load();
        // If we are actively playing or intent is to play, play
        if (isPlaying && isInitialized) {
          // Only auto-play if we are actively playing and initialized
          // (prevents auto-play on refresh if we wanted to respect 'isPlaying' strictly,
          // but keeping isPlaying false on mount prevents this anyway)
          audioRef.current.play().catch((e) => console.error("Play error:", e));
        }
      }
    }
  }, [currentTrack, isPlaying, isInitialized]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (isRepeat) {
      audioRef.current?.play();
      return;
    }
    handleNext();
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => console.error("Play error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  // Queue Logic: Shuffle
  useEffect(() => {
    if (!isInitialized) return;

    if (isShuffle) {
      // Shuffle mode enabled: shuffle CURRENT queue
      const currentSong = queue[currentTrackIndex];
      const rest = queue.filter((t) => t.id !== currentSong.id);

      // Durstenfeld shuffle
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }

      const newQueue = [currentSong, ...rest];
      setQueue(newQueue);
      setCurrentTrackIndex(0); // Current song is now first
    } else {
      // Shuffle disabled: restore original order
      if (originalQueue.length > 0) {
        const currentSong = queue[currentTrackIndex];
        // We know 'queue' might be shuffled, so currentSong is valid.
        // We find it in originalQueue.
        const originalIndex = originalQueue.findIndex(
          (t) => t.id === currentSong.id
        );
        if (originalIndex !== -1) {
          setQueue(originalQueue);
          setCurrentTrackIndex(originalIndex);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShuffle, isInitialized]); // Only run when shuffle toggles

  const handleNext = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % queue.length);
    setIsPlaying(true);
  }, [queue.length]);

  const handlePrev = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    setCurrentTrackIndex((prev) => (prev - 1 + queue.length) % queue.length);
    setIsPlaying(true);
  }, [queue.length]);

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTrackSelect = (track: Track, contextTracks: Track[] = TRACKS) => {
    // 1. Update queue if context changed
    // Check if we are switching context (e.g. from All tracks to Playlist A)
    // A simple heuristic: if the passed context tracks are different length or ids than originalQueue

    // We update queue to the new context
    setOriginalQueue(contextTracks);
    setQueue(contextTracks);

    // 2. Find index in new context
    const index = contextTracks.findIndex((t) => t.id === track.id);
    if (index !== -1) {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
    }

    // Mobile UX: Close library, open player
    setShowFullPlayerMobile(true);
  };

  const handlePlayPlaylist = (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist && playlist.trackIds.length > 0) {
      const playlistTracks = playlist.trackIds
        .map((id) => TRACKS.find((t) => t.id === id))
        .filter(Boolean) as Track[];
      if (playlistTracks.length > 0) {
        handleTrackSelect(playlistTracks[0], playlistTracks);
      }
    }
  };

  // -- Media Session API --
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.genre,
    });
  }, [currentTrack]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const handleSeekTo = (details: MediaSessionActionDetails) => {
      if (details.seekTime !== undefined && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
        setCurrentTime(details.seekTime);
      }
    };

    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play().catch((e) => console.error("Play error:", e));
      setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler("previoustrack", handlePrev);
    navigator.mediaSession.setActionHandler("nexttrack", handleNext);
    navigator.mediaSession.setActionHandler("seekto", handleSeekTo);
  }, [handleNext, handlePrev]);

  // Prevent flash of content before init
  if (!isInitialized) return <div className="bg-black h-dvh w-full" />;

  return (
    <div className="flex flex-col h-dvh w-full bg-black text-white overflow-hidden relative font-sans">
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* --- Mobile Only Layout --- */}

      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 z-20 bg-black/90 backdrop-blur-md border-b border-zinc-900 shrink-0">
        <span className="font-bold text-lg flex items-center gap-2">
          <span className="bg-blue-600 rounded-md p-1">
            <Music size={16} />
          </span>
          Music
        </span>
        {/* No Menu button requested */}
      </div>

      {/* Main Content (Library) */}
      <div className="flex-1 overflow-hidden relative">
        <Library
          tracks={TRACKS}
          playlists={playlists}
          currentTrackId={currentTrack.id}
          isPlaying={isPlaying}
          onTrackSelect={(t) => handleTrackSelect(t, TRACKS)} // Default context
          onCreatePlaylist={createPlaylist}
          onDeletePlaylist={deletePlaylist}
          onAddToPlaylist={addTrackToPlaylist}
          onRemoveFromPlaylist={removeTrackFromPlaylist}
          onPlayPlaylist={handlePlayPlaylist}
        />
      </div>

      {/* Mini Player (Floating Bottom) */}
      {/* Added bottom-safe padding wrapper */}
      <div className="bg-zinc-900 border-t border-zinc-800 pb-[env(safe-area-inset-bottom)] shrink-0">
        <div
          onClick={() => setShowFullPlayerMobile(true)}
          className="h-16 flex items-center px-4 gap-3 cursor-pointer z-30"
        >
          <div className="w-10 h-10 rounded-md bg-zinc-800 overflow-hidden relative shrink-0">
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, #1e3a8a, #000000)",
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {currentTrack.title}
            </div>
            <div className="text-xs text-zinc-400 truncate">
              {currentTrack.artist}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
              className="p-2 rounded-full bg-white text-black active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Player */}
      <div
        className={`
            fixed inset-0 bg-zinc-950 z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${showFullPlayerMobile ? "translate-y-0" : "translate-y-[100dvh]"}
        `}
      >
        <div className="h-14 flex items-center justify-between px-4 pt-safe shrink-0">
          <button
            onClick={() => setShowFullPlayerMobile(false)}
            className="p-2 text-zinc-400 active:text-white"
          >
            <ChevronDown />
          </button>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 min-h-0 overflow-y-auto">
          <div className="w-full aspect-square max-w-[320px] shadow-2xl rounded-2xl overflow-hidden relative shrink-0">
            <SongInfo track={currentTrack} />
          </div>

          <div className="w-full max-w-[320px] space-y-6">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-bold truncate leading-tight">
                {currentTrack.title}
              </h2>
              <p className="text-lg text-zinc-400 truncate">
                {currentTrack.artist}
              </p>
            </div>

            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />

            <div className="flex justify-center py-2">
              <PlayerControls
                isPlaying={isPlaying}
                onPlayPause={togglePlayPause}
                onNext={handleNext}
                onPrev={handlePrev}
                isShuffle={isShuffle}
                onToggleShuffle={() => setIsShuffle(!isShuffle)}
                isRepeat={isRepeat}
                onToggleRepeat={() => setIsRepeat(!isRepeat)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
