"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import {
  getNextLoopMode,
  isStandalonePwa,
} from "@/components/player/playerUtils";
import PlayerFullView from "@/components/player/PlayerFullView";
import PlayerMiniBar from "@/components/player/PlayerMiniBar";
import { useSettingsStore } from "@/store/useSettingsStore";
import { audioEngine } from "@/lib/audio/audioEngine";

export default function Player() {
  const {
    currentSong,
    playbackSourceType,
    playbackSourceName,
    isPlaying,
    playNext,
    playPrevious,
    isFullView,
    setIsFullView,
    playOnlyThisSong,
    setPlayOnlyThisSong,
  } = usePlayerStore();

  const { settings, setSettings } = useSettingsStore();

  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [progress, setProgress] = useState(0);

  const wakeLockRef = useRef<any>(null);
  const touchStartY = useRef<number | null>(null);

  // Initialize and subscribe to AudioEngine
  useEffect(() => {
    audioEngine.init();
    setAnalyser(audioEngine.getAnalyserNode());

    const unsubscribe = audioEngine.subscribe({
      onProgress: (currentTime) => {
        setProgress(currentTime);
      },
      onStateChange: () => {
        setAnalyser(audioEngine.getAnalyserNode());
      },
      onSongChange: (song) => {
        if (song) {
          setPlaybackRate(song.speed ?? 1.0);
          audioEngine.setPlaybackRate(song.speed ?? 1.0);
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Update dynamic range compressor whenever setting changes
  useEffect(() => {
    audioEngine.configureCompressor(settings.reduceDynamicRange);
  }, [settings.reduceDynamicRange]);

  // Synchronize playback rate and volume with audio engine
  useEffect(() => {
    audioEngine.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  // Update song speed when currentSong changes
  useEffect(() => {
    if (currentSong) {
      const speed = currentSong.speed ?? 1.0;
      setPlaybackRate(speed);
      audioEngine.setPlaybackRate(speed);
      setVolume(1);
      audioEngine.setVolume(1);
    }
  }, [currentSong?.id]);

  const handleSeek = (time: number) => {
    audioEngine.seek(time);
    setProgress(time);
  };

  const handleSkipForward = () => {
    audioEngine.skipForward(settings.skipDuration);
  };

  const handleSkipBackward = () => {
    audioEngine.skipBackward(settings.skipDuration);
  };

  const handleTogglePlay = () => {
    audioEngine.togglePlay();
  };

  const handleToggleLoop = () => {
    const nextMode = getNextLoopMode(settings.loop);
    setSettings({ loop: nextMode });
  };

  // Screen WakeLock management
  const requestWakeLock = async () => {
    if (
      typeof window === "undefined" ||
      !("wakeLock" in navigator) ||
      !settings.keepScreenOn ||
      !isPlaying ||
      !isStandalonePwa() ||
      wakeLockRef.current
    ) {
      return;
    }

    try {
      wakeLockRef.current = await (
        navigator as Navigator & {
          wakeLock: {
            request: (type: string) => Promise<{
              release: () => Promise<void>;
              addEventListener: (event: string, callback: () => void) => void;
            }>;
          };
        }
      ).wakeLock.request("screen");
      wakeLockRef.current.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
    } catch (error) {
      console.error("WakeLock request failed:", error);
      wakeLockRef.current = null;
    }
  };

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch (error) {
      console.error("WakeLock release failed:", error);
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!settings.keepScreenOn || !isPlaying) {
      void releaseWakeLock();
      return;
    }

    if (!("wakeLock" in navigator) || !isStandalonePwa()) return;

    void requestWakeLock();
  }, [isPlaying, settings.keepScreenOn, currentSong?.id]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === "visible" &&
        isPlaying &&
        settings.keepScreenOn &&
        isStandalonePwa() &&
        "wakeLock" in navigator
      ) {
        await requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying, settings.keepScreenOn]);

  useEffect(() => {
    return () => {
      void releaseWakeLock();
    };
  }, []);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartY.current === null) return;

    const deltaY = event.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaY) > 50) {
      if (deltaY < 0 && !isFullView) {
        setIsFullView(true);
      } else if (deltaY > 0 && isFullView) {
        setIsFullView(false);
        setMenuOpen(false);
      }
    }

    touchStartY.current = null;
  };

  if (!currentSong) return null;

  return (
    <>
      {!isFullView && (
        <PlayerMiniBar
          currentSong={currentSong}
          progress={progress}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onOpenFullView={() => setIsFullView(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      )}

      <PlayerFullView
        isFullView={isFullView}
        currentSong={currentSong}
        progress={progress}
        isPlaying={isPlaying}
        analyser={analyser}
        playbackSourceType={playbackSourceType}
        playbackSourceName={playbackSourceName}
        playOnlyThisSong={playOnlyThisSong}
        playbackRate={playbackRate}
        volume={volume}
        settings={settings}
        onClose={() => {
          setIsFullView(false);
          setMenuOpen(false);
        }}
        onTogglePlay={handleTogglePlay}
        onPlayPrevious={playPrevious}
        onPlayNext={playNext}
        onToggleShuffle={() => setSettings({ shuffle: !settings.shuffle })}
        onToggleLoop={handleToggleLoop}
        onSkipBackward={handleSkipBackward}
        onSkipForward={handleSkipForward}
        onSeek={handleSeek}
        onTogglePlayOnlyThisSong={() => setPlayOnlyThisSong(!playOnlyThisSong)}
        onPlaybackRateChange={setPlaybackRate}
        onVolumeChange={setVolume}
        onMenuOpenChange={setMenuOpen}
        menuOpen={menuOpen}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
    </>
  );
}
