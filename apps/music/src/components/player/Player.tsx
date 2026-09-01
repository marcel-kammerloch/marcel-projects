"use client";

import { useEffect, useRef, useState } from "react";

import { usePlayerStore } from "@/store/usePlayerStore";
import {
  getNextLoopMode,
  getSongSource,
  isStandalonePwa,
} from "@/components/player/playerUtils";
import PlayerFullView from "@/components/player/PlayerFullView";
import PlayerMiniBar from "@/components/player/PlayerMiniBar";

let globalAudioContext: AudioContext | null = null;
let globalSourceNode: MediaElementAudioSourceNode | null = null;
let globalCompressorNode: DynamicsCompressorNode | null = null;
let globalGainNode: GainNode | null = null;
let globalAnalyserNode: AnalyserNode | null = null;

const configureCompressor = (
  compressor: DynamicsCompressorNode,
  gainNode: GainNode,
  reduceRange: boolean,
  ctx: AudioContext,
) => {
  const time = ctx.currentTime;

  if (reduceRange) {
    compressor.threshold.setTargetAtTime(-30, time, 0.05);
    compressor.knee.setTargetAtTime(20, time, 0.05);
    compressor.ratio.setTargetAtTime(4.0, time, 0.05);
    compressor.attack.setTargetAtTime(0.005, time, 0.05);
    compressor.release.setTargetAtTime(0.15, time, 0.05);
    gainNode.gain.setTargetAtTime(2.0, time, 0.05);
  } else {
    compressor.threshold.setTargetAtTime(0, time, 0.05);
    compressor.knee.setTargetAtTime(0, time, 0.05);
    compressor.ratio.setTargetAtTime(1.0, time, 0.05);
    compressor.attack.setTargetAtTime(0.003, time, 0.05);
    compressor.release.setTargetAtTime(0.25, time, 0.05);
    gainNode.gain.setTargetAtTime(1.0, time, 0.05);
  }
};

export default function Player() {
  const {
    currentSong,
    queue,
    playbackSourceType,
    playbackSourceName,
    isPlaying,
    playNext,
    playPrevious,
    setIsPlaying,
    isFullView,
    setIsFullView,
    playOnlyThisSong,
    setPlayOnlyThisSong,
    settings,
    setSettings,
  } = usePlayerStore();

  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [loopedOnceForCurrentSong, setLoopedOnceForCurrentSong] =
    useState(false);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const prefetchAudioRef = useRef<HTMLAudioElement | null>(null);
  const prefetchedSongIdRef = useRef<string | null>(null);
  const wakeLockRef = useRef<any>(null);
  const touchStartY = useRef<number | null>(null);

  const getNextSongCandidate = () => {
    if (!currentSong || queue.length === 0) return null;

    if (settings.shuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      return queue[randomIndex];
    }

    const currentIndex = queue.findIndex((song) => song.id === currentSong.id);
    if (currentIndex === -1) return null;

    if (currentIndex === queue.length - 1) {
      return settings.loop === "repeat" ? queue[0] : null;
    }

    return queue[currentIndex + 1];
  };

  const initAudioEngine = () => {
    if (typeof window === "undefined" || !audioRef.current) return;

    try {
      if (!globalAudioContext) {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;
        if (!AudioContextClass) return;

        globalAudioContext = new AudioContextClass();
      }

      if (!globalCompressorNode || !globalGainNode || !globalAnalyserNode) {
        globalCompressorNode = globalAudioContext.createDynamicsCompressor();
        globalGainNode = globalAudioContext.createGain();
        globalAnalyserNode = globalAudioContext.createAnalyser();
        globalAnalyserNode.fftSize = 128;
        globalAnalyserNode.smoothingTimeConstant = 0.8;

        configureCompressor(
          globalCompressorNode,
          globalGainNode,
          settings.reduceDynamicRange,
          globalAudioContext,
        );
      }

      setAnalyser(globalAnalyserNode);

      const mediaElement = audioRef.current as HTMLAudioElement & {
        _sourceNodeConnected?: boolean;
      };

      if (!mediaElement._sourceNodeConnected) {
        try {
          if (globalSourceNode) {
            globalSourceNode.disconnect();
          }

          globalSourceNode =
            globalAudioContext.createMediaElementSource(mediaElement);
          mediaElement._sourceNodeConnected = true;

          globalSourceNode.connect(globalCompressorNode);
          globalCompressorNode.connect(globalGainNode);
          globalGainNode.connect(globalAnalyserNode);
          globalAnalyserNode.connect(globalAudioContext.destination);
        } catch (sourceErr) {
          mediaElement._sourceNodeConnected = true;
          console.warn(
            "Audio element source node already attached:",
            sourceErr,
          );
        }
      }
    } catch (error) {
      console.error("Failed to initialize Web Audio API:", error);
    }
  };

  useEffect(() => {
    if (currentSong) {
      initAudioEngine();
    }
  }, [currentSong?.id]);

  useEffect(() => {
    if (globalAudioContext && globalCompressorNode && globalGainNode) {
      configureCompressor(
        globalCompressorNode,
        globalGainNode,
        settings.reduceDynamicRange,
        globalAudioContext,
      );
    }
  }, [settings.reduceDynamicRange]);

  useEffect(() => {
    const resumeAudioContext = () => {
      if (globalAudioContext && globalAudioContext.state === "suspended") {
        globalAudioContext.resume().catch((error) => {
          console.error("Failed to resume AudioContext:", error);
        });
      }
    };

    window.addEventListener("click", resumeAudioContext);
    window.addEventListener("touchstart", resumeAudioContext);

    return () => {
      window.removeEventListener("click", resumeAudioContext);
      window.removeEventListener("touchstart", resumeAudioContext);
    };
  }, []);

  useEffect(() => {
    setPlaybackRate(currentSong?.speed ?? 1.0);
    setVolume(1);
    setLoopedOnceForCurrentSong(false);
    setPlayOnlyThisSong(false);
  }, [currentSong?.id, setPlayOnlyThisSong]);

  useEffect(() => {
    if (settings.loop !== "off") {
      setPlayOnlyThisSong(false);
    }
  }, [settings.loop, setPlayOnlyThisSong]);

  useEffect(() => {
    if (settings.loop !== "once") {
      setLoopedOnceForCurrentSong(false);
    }
  }, [settings.loop]);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.playbackRate = playbackRate;
    audioRef.current.volume = volume;

    if (isPlaying) {
      if (globalAudioContext && globalAudioContext.state === "suspended") {
        globalAudioContext.resume().catch((error) => {
          console.error("Failed to resume AudioContext on play:", error);
        });
      }

      audioRef.current.play().catch((error) => {
        console.error("Playback failed:", error);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong, playbackRate, volume]);

  const preloadNextSong = () => {
    if (typeof window === "undefined" || settings.saveBattery || !isPlaying) {
      return;
    }

    const nextSong = getNextSongCandidate();
    if (!nextSong) {
      return;
    }

    const nextSongUrl = getSongSource(nextSong);
    if (!nextSongUrl) return;

    if (
      prefetchedSongIdRef.current === nextSong.id &&
      prefetchAudioRef.current &&
      (prefetchAudioRef.current.currentSrc || prefetchAudioRef.current.src) === nextSongUrl
    ) {
      return;
    }

    const audio = prefetchAudioRef.current ?? new Audio();
    audio.src = nextSongUrl;
    audio.preload = "auto";
    audio.load();
    prefetchAudioRef.current = audio;
    prefetchedSongIdRef.current = nextSong.id;
  };

  useEffect(() => {
    // Reset prefetched song tracking when current track changes
    prefetchedSongIdRef.current = null;
    if (settings.saveBattery || !isPlaying) {
      if (prefetchAudioRef.current) {
        prefetchAudioRef.current.removeAttribute("src");
        prefetchAudioRef.current.load();
      }
    }
  }, [currentSong?.id, settings.saveBattery, isPlaying]);

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
    if (!("mediaSession" in navigator) || !currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist || "Unknown Artist",
      album: currentSong.genre || "",
      artwork: [
        { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("previoustrack", () =>
      playPrevious(),
    );
    navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
    navigator.mediaSession.setActionHandler("seekforward", () => skipForward());
    navigator.mediaSession.setActionHandler("seekbackward", () =>
      skipBackward(),
    );
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (audioRef.current && details.seekTime !== undefined) {
        audioRef.current.currentTime = details.seekTime;
        setProgress(details.seekTime);
      }
    });
  }, [
    currentSong,
    setIsPlaying,
    playNext,
    playPrevious,
    settings.skipDuration,
  ]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress(currentTime);

      // Preload next track ~10 seconds before current track ends (or halfway through if track is shorter than 20s)
      if (duration && !isNaN(duration) && isPlaying && !settings.saveBattery) {
        const remainingTime = duration - currentTime;
        const preloadThreshold = Math.min(10, duration / 2);
        if (remainingTime <= preloadThreshold && remainingTime > 0) {
          const nextCandidate = getNextSongCandidate();
          if (nextCandidate && prefetchedSongIdRef.current !== nextCandidate.id) {
            preloadNextSong();
          }
        }
      }

      if (
        "mediaSession" in navigator &&
        "setPositionState" in navigator.mediaSession &&
        duration &&
        !isNaN(duration)
      ) {
        try {
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: audioRef.current.playbackRate || 1,
            position: currentTime,
          });
        } catch {
          // ignore setPositionState errors during rapid seek transitions
        }
      }
    }
  };

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

  const handleEnded = () => {
    if (!audioRef.current) {
      playNext();
      return;
    }

    if (playOnlyThisSong) {
      setPlayOnlyThisSong(false);
      setIsPlaying(false);
      return;
    }

    if (settings.loop === "once") {
      if (!loopedOnceForCurrentSong) {
        setLoopedOnceForCurrentSong(true);
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch((error) => console.error("Loop replay failed", error));
        return;
      }
    }

    if (settings.loop === "repeat") {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((error) => console.error("Loop replay failed", error));
      return;
    }

    playNext();
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

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
  }, [isPlaying, settings.keepScreenOn, currentSong]);

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

  const handleTogglePlay = () => setIsPlaying(!isPlaying);
  const handleToggleLoop = () => {
    const nextMode = getNextLoopMode(settings.loop);
    setSettings({ loop: nextMode });
  };

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        src={getSongSource(currentSong)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => {
          if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
          }
        }}
        onCanPlay={() => {
          if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
          }
        }}
      />

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
        onSkipBackward={skipBackward}
        onSkipForward={skipForward}
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
