"use client";

import { useState, useRef, useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  ChevronDown,
  Settings as SettingsIcon,
} from "lucide-react";

export default function Player() {
  const {
    currentSong,
    isPlaying,
    playNext,
    playPrevious,
    setIsPlaying,
    isFullView,
    setIsFullView,
    settings,
    setSettings,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement>(null);

  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((e) => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration || 0,
        audioRef.current.currentTime + settings.skipDuration,
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime - settings.skipDuration,
      );
    }
  };

  useEffect(() => {
    if ("mediaSession" in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist || "Unknown Artist",
        album: currentSong.genre || "",
        artwork: [
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler("pause", () =>
        setIsPlaying(false),
      );
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        playPrevious(),
      );
      navigator.mediaSession.setActionHandler("nexttrack", () => playNext());

      // Setting these lets the OS UI show skip buttons usually mapping to seek
      navigator.mediaSession.setActionHandler("seekforward", () => {
        skipForward();
      });
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        skipBackward();
      });
    }
  }, [
    currentSong,
    setIsPlaying,
    playNext,
    playPrevious,
    settings.skipDuration,
  ]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;

    // Swipe sensitivity (min 50px)
    if (Math.abs(deltaY) > 50) {
      if (deltaY < 0 && !isFullView) {
        // Swipe up
        setIsFullView(true);
      } else if (deltaY > 0 && isFullView) {
        // Swipe down
        setIsFullView(false);
      }
    }
    touchStartY.current = null;
  };

  const handleEnded = () => {
    if (settings.loop && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((e) => console.error("Loop replay failed", e));
    } else {
      playNext();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Generate a deterministic gradient based on track ID
  const getGradient = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c1 = Math.abs(hash % 360);
    const c2 = (c1 + 40) % 360;
    // bg-linear-to-br from-blue-600 to-blue-600
    return `linear-gradient(135deg, hsl(${c1}, 70%, 20%), hsl(${c2}, 70%, 10%))`;
  };

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentSong.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Persistent Bottom Bar */}
      {!isFullView && (
        <div
          className="fixed bottom-16 sm:bottom-16 left-0 right-0 h-16 sm:h-20 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 px-4 flex items-center justify-between cursor-pointer z-40 transition-transform duration-300"
          style={{ touchAction: "none" }}
          onClick={() => setIsFullView(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Progress bar line for bottom view */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-zinc-800">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{
                width: `${(progress / (currentSong.duration || 1)) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 rounded-md flex items-center justify-center shrink-0 relative overflow-hidden">
              <div className="w-full h-full bg-linear-to-br from-blue-600 to-blue-600 opacity-80 absolute inset-0"></div>
              <MusicIcon className="w-5 h-5 text-white relative z-10" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-white font-medium text-sm sm:text-base truncate">
                {currentSong.title}
              </span>
              <span className="text-zinc-400 text-xs sm:text-sm truncate">
                {currentSong.artist || "Unknown Artist"}
              </span>
            </div>
          </div>

          <div
            className="flex items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 ml-1" fill="currentColor" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Player */}
      <div
        className={`fixed inset-0 bg-zinc-950 z-50 flex flex-col transition-transform duration-500 ease-out ${isFullView ? "translate-y-0" : "translate-y-full"}`}
        style={{ touchAction: "none" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
          <div className="flex justify-between items-center mb-8 pt-4">
            <button
              onClick={() => setIsFullView(false)}
              className="text-white p-2"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
            <span className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Now Playing
            </span>
            <button
              onClick={() => setShowSettings(true)}
              className="text-white p-2"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden group"
              style={{ background: getGradient(currentSong.id) }}
            >
              {/* Cover Image Placeholder */}
              <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
              <MusicIcon className="w-24 h-24 text-white/50 relative z-10" />
            </div>
          </div>

          <div className="mt-8 mb-4">
            <h2 className="text-2xl font-bold text-white truncate">
              {currentSong.title}
            </h2>
            <p className="text-lg text-zinc-400 truncate mt-1">
              {currentSong.artist || "Unknown Artist"}
            </p>
          </div>

          <div className="mb-8">
            <input
              type="range"
              min={0}
              max={currentSong.duration || 100}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${(progress / (currentSong.duration || 1)) * 100}%, #27272a ${(progress / (currentSong.duration || 1)) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-zinc-500 font-medium mt-2">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(currentSong.duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 max-w-[300px] w-full mx-auto">
            <button
              onClick={() => setSettings({ shuffle: !settings.shuffle })}
              className={`${settings.shuffle ? "text-blue-500" : "text-zinc-500 hover:text-white"} transition`}
            >
              <Shuffle className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-6">
              <button
                onClick={playPrevious}
                className="text-white hover:text-blue-400 transition"
              >
                <SkipBack className="w-10 h-10" fill="currentColor" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-white/15"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10" fill="currentColor" />
                ) : (
                  <Play className="w-10 h-10 ml-2" fill="currentColor" />
                )}
              </button>

              <button
                onClick={playNext}
                className="text-white hover:text-blue-400 transition"
              >
                <SkipForward className="w-10 h-10" fill="currentColor" />
              </button>
            </div>

            <button
              onClick={() => setSettings({ loop: !settings.loop })}
              className={`${settings.loop ? "text-blue-500" : "text-zinc-500 hover:text-white"} transition`}
            >
              <Repeat className="w-6 h-6" />
            </button>
          </div>

          <div className="flex justify-center gap-8 text-zinc-500 font-medium text-sm pb-8">
            <button
              onClick={skipBackward}
              className="hover:text-white flex items-center transition bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800"
            >
              -{settings.skipDuration}s
            </button>
            <button
              onClick={skipForward}
              className="hover:text-white flex items-center transition bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800"
            >
              +{settings.skipDuration}s
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">
              Player Settings
            </h3>

            <div className="mb-6">
              <label className="text-sm text-zinc-400 block mb-3 font-medium">
                Fast-Forward & Rewind Duration
              </label>
              <div className="flex gap-2 bg-zinc-950 p-1 rounded-lg">
                {[10, 15, 30].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSettings({ skipDuration: val })}
                    className={`flex-1 py-2.5 rounded-md font-semibold text-sm transition ${settings.skipDuration === val ? "bg-zinc-800 text-white shadow-md border border-zinc-700" : "text-zinc-400 hover:text-white"}`}
                  >
                    {val}s
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 pt-4 border-t border-zinc-800">
              <label className="text-sm text-zinc-400 block mb-3 font-medium">
                Maintenance
              </label>
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to clear all offline songs and reset settings?")) {
                    try {
                      const keys = await caches.keys();
                      await Promise.all(keys.map((key) => caches.delete(key)));
                      localStorage.clear();
                      window.location.href = "/";
                    } catch (e) {
                      console.error("Reset failed", e);
                      alert("Reset failed: " + String(e));
                    }
                  }
                }}
                className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                Reset App & Clear Cache
              </button>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 text-white font-semibold py-3.5 rounded-xl mt-4 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const MusicIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);
