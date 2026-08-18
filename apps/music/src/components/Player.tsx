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
  Menu as MenuIcon,
  Volume2,
  Gauge,
  Disc3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import AudioVisualizer from "@/components/player/AudioVisualizer";
import { STORAGE_URL } from "@/lib/constants";

let globalAudioContext: AudioContext | null = null;
let globalSourceNode: MediaElementAudioSourceNode | null = null;
let globalCompressorNode: DynamicsCompressorNode | null = null;
let globalGainNode: GainNode | null = null;
let globalAnalyserNode: AnalyserNode | null = null;
let globalAudioElement: HTMLAudioElement | null = null;

export default function Player() {
  const {
    currentSong,
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

  const audioRef = useRef<HTMLAudioElement>(null);
  const wakeLockRef = useRef<any>(null);

  const [progress, setProgress] = useState(0);

  // Helper to configure the compressor smoothly
  const configureCompressor = (
    compressor: DynamicsCompressorNode,
    gainNode: GainNode,
    reduceRange: boolean,
    ctx: AudioContext,
  ) => {
    const time = ctx.currentTime;
    if (reduceRange) {
      // Noticeable but musical compression for classical/dynamic music.
      // Threshold at -30dB catches most of the dynamic range.
      // Ratio 4:1 meaningfully reduces loud peaks.
      // Soft knee of 20dB keeps the transition smooth and artefact-free.
      // Makeup gain of +6dB compensates for the gain reduction on loud parts,
      // which in turn lifts quiet passages relative to the original.
      compressor.threshold.setTargetAtTime(-30, time, 0.05);
      compressor.knee.setTargetAtTime(20, time, 0.05);
      compressor.ratio.setTargetAtTime(4.0, time, 0.05);
      compressor.attack.setTargetAtTime(0.005, time, 0.05);
      compressor.release.setTargetAtTime(0.15, time, 0.05);
      gainNode.gain.setTargetAtTime(2.0, time, 0.05); // +6 dB makeup gain
    } else {
      // Transparent bypass: ratio 1:1 and unity gain
      compressor.threshold.setTargetAtTime(0, time, 0.05);
      compressor.knee.setTargetAtTime(0, time, 0.05);
      compressor.ratio.setTargetAtTime(1.0, time, 0.05);
      compressor.attack.setTargetAtTime(0.003, time, 0.05);
      compressor.release.setTargetAtTime(0.25, time, 0.05);
      gainNode.gain.setTargetAtTime(1.0, time, 0.05); // unity gain
    }
  };

  // Initialize Web Audio engine lazily
  const initAudioEngine = () => {
    if (typeof window === "undefined" || !audioRef.current) return;

    try {
      if (!globalAudioContext) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
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

      // Connect source to compressor and analyser only once per HTMLMediaElement
      const mediaElement = audioRef.current as HTMLAudioElement & {
        _sourceNodeConnected?: boolean;
      };

      if (!mediaElement._sourceNodeConnected) {
        try {
          if (globalSourceNode) {
            try {
              globalSourceNode.disconnect();
            } catch {}
          }
          globalAudioElement = mediaElement;
          globalSourceNode =
            globalAudioContext.createMediaElementSource(mediaElement);
          mediaElement._sourceNodeConnected = true;

          // Chain: Source -> Compressor -> Gain (makeup) -> Analyser -> Destination
          globalSourceNode.connect(globalCompressorNode);
          globalCompressorNode.connect(globalGainNode);
          globalGainNode.connect(globalAnalyserNode);
          globalAnalyserNode.connect(globalAudioContext.destination);
        } catch (sourceErr) {
          mediaElement._sourceNodeConnected = true;
          console.warn("Audio element source node already attached:", sourceErr);
        }
      }
    } catch (error) {
      console.error("Failed to initialize Web Audio API:", error);
    }
  };

  // Initialize the audio engine when the player mounts/renders a song
  useEffect(() => {
    if (currentSong) {
      initAudioEngine();
    }
  }, [currentSong?.id]);

  // Update compressor configuration when setting changes
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

  // Resume AudioContext on user interaction if suspended
  useEffect(() => {
    const resumeAudioContext = () => {
      if (globalAudioContext && globalAudioContext.state === "suspended") {
        globalAudioContext
          .resume()
          .catch((e) => console.error("Failed to resume AudioContext:", e));
      }
    };

    window.addEventListener("click", resumeAudioContext);
    window.addEventListener("touchstart", resumeAudioContext);
    return () => {
      window.removeEventListener("click", resumeAudioContext);
      window.removeEventListener("touchstart", resumeAudioContext);
    };
  }, []);

  // Reset volume and playback speed when the song changes
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
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = volume;

      if (isPlaying) {
        if (globalAudioContext && globalAudioContext.state === "suspended") {
          globalAudioContext
            .resume()
            .catch((e) =>
              console.error("Failed to resume AudioContext on play:", e),
            );
        }

        audioRef.current
          .play()
          .catch((e) => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong, playbackRate, volume]);

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
        // Swipe down — also close the menu
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
          .catch((e) => console.error("Loop replay failed", e));
        return;
      }
    }

    if (settings.loop === "repeat") {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((e) => console.error("Loop replay failed", e));
      return;
    }

    playNext();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const isStandalonePwa = () => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
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
      wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
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
      releaseWakeLock();
      return;
    }

    if (!("wakeLock" in navigator) || !isStandalonePwa()) return;

    requestWakeLock();
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
      releaseWakeLock();
    };
  }, []);

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
        crossOrigin="anonymous"
        src={`${STORAGE_URL}/${currentSong.path}`}
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

      {/* Persistent Bottom Bar */}
      {!isFullView && (
        <div
          className="fixed bottom-16 sm:bottom-16 left-0 right-0 h-16 sm:h-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between cursor-pointer z-40 transition-transform duration-300"
          style={{ touchAction: "none" }}
          onClick={() => setIsFullView(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Progress bar line for bottom view */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full bg-blue-500 transition-all duration-100"
              style={{
                width: `${(progress / (currentSong.duration || 1)) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-200 dark:bg-zinc-800 rounded-md flex items-center justify-center shrink-0 relative overflow-hidden">
              <div className="w-full h-full bg-linear-to-br from-blue-600 to-blue-600 opacity-80 absolute inset-0"></div>
              <MusicIcon className="w-5 h-5 text-white relative z-10" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-zinc-900 dark:text-white font-medium text-sm sm:text-base truncate">
                {currentSong.title}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm truncate">
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
              className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center"
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
        className={`fixed inset-0 bg-white dark:bg-zinc-950 z-50 flex flex-col transition-transform duration-500 ease-out ${isFullView ? "translate-y-0" : "translate-y-full"}`}
        style={{ touchAction: "none" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
          <div className="flex justify-between items-center mb-6 pt-4">
            <button
              onClick={() => {
                setIsFullView(false);
                setMenuOpen(false);
              }}
              className="text-zinc-900 dark:text-white p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
            >
              <ChevronDown className="w-8 h-8" />
            </button>
            <div className="flex-1 min-w-0 px-2 text-center">
              <p className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                Now Playing
              </p>
              {playbackSourceType && playbackSourceName && (
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5 wrap-break-word line-clamp-2 px-1">
                  Playing from {playbackSourceType} &ldquo;{playbackSourceName}
                  &rdquo;
                </p>
              )}
            </div>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger
                render={(props, state) => (
                  <button
                    {...props}
                    disabled={state.disabled}
                    className="text-zinc-900 dark:text-white p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
                  >
                    <MenuIcon className="w-6 h-6" />
                  </button>
                )}
              />
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Player Settings</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Gauge className="w-4 h-4" />
                        <span>Speed</span>
                      </div>
                      <span className="font-medium">
                        {playbackRate.toFixed(2)}x
                      </span>
                    </div>
                    <Slider
                      value={[playbackRate]}
                      min={0.5}
                      max={1.5}
                      step={0.05}
                      onValueChange={(value) =>
                        setPlaybackRate(
                          Number(Array.isArray(value) ? value[0] : value),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Volume2 className="w-4 h-4" />
                        <span>Volume</span>
                      </div>
                      <span className="font-medium">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(value) =>
                        setVolume(
                          Number(Array.isArray(value) ? value[0] : value),
                        )
                      }
                    />
                  </div>
                  <DropdownMenuSeparator />
                  <button
                    type="button"
                    onClick={() => setPlayOnlyThisSong(!playOnlyThisSong)}
                    className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs font-medium transition ${
                      playOnlyThisSong
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Disc3 className="w-4 h-4" />
                      Play only this song
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${playOnlyThisSong ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"}`}>
                      {playOnlyThisSong ? "ON" : "OFF"}
                    </span>
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-60 h-60 sm:w-72 sm:h-72 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden group"
              style={{ background: getGradient(currentSong.id) }}
            >
              {/* Cover Image Placeholder */}
              <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
              <MusicIcon className="w-20 h-20 text-white/50 relative z-10" />
            </div>
          </div>

          {/* Real-Time Audio Visualizer */}
          <div className="mt-3 mb-1">
            <AudioVisualizer
              analyser={analyser}
              isPlaying={isPlaying}
              className="max-w-xs mx-auto"
            />
          </div>

          <div className="mt-2 mb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white truncate">
                  {currentSong.title}
                </h2>
                <p className="text-base text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {currentSong.artist || "Unknown Artist"}
                </p>
              </div>

              {/* Play Only This Song Mode Toggle */}
              <button
                type="button"
                onClick={() => setPlayOnlyThisSong(!playOnlyThisSong)}
                aria-pressed={playOnlyThisSong}
                className={`shrink-0 flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  playOnlyThisSong
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/50"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                }`}
                title={
                  playOnlyThisSong
                    ? "Active: Playback will stop after this song"
                    : "Enable to stop playback after this song finishes"
                }
              >
                <span>{playOnlyThisSong ? "Play 1x (Active)" : "Play 1x"}</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <input
              type="range"
              min={0}
              max={currentSong.duration || 100}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${(progress / (currentSong.duration || 1)) * 100}%, ${typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "#27272a" : "#e4e4e7"} ${(progress / (currentSong.duration || 1)) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-zinc-500 font-medium mt-2">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(currentSong.duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 max-w-[80%] w-full mx-auto">
            <button
              onClick={() => setSettings({ shuffle: !settings.shuffle })}
              className={`p-2 rounded-full transition ${settings.shuffle ? "text-blue-500 hc:bg-blue-500/20 hc:ring-2 hc:ring-blue-500/50 hc:text-blue-400" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hc:text-zinc-400"}`}
            >
              <Shuffle className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-6">
              <button
                onClick={playPrevious}
                className="text-zinc-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                <SkipBack className="w-10 h-10" fill="currentColor" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-20 h-20 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-zinc-500/20 dark:shadow-white/15"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10" fill="currentColor" />
                ) : (
                  <Play className="w-10 h-10 ml-2" fill="currentColor" />
                )}
              </button>

              <button
                onClick={playNext}
                className="text-zinc-900 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition"
              >
                <SkipForward className="w-10 h-10" fill="currentColor" />
              </button>
            </div>

            <button
              onClick={() => {
                const nextMode =
                  settings.loop === "off"
                    ? "once"
                    : settings.loop === "once"
                      ? "repeat"
                      : "off";
                setSettings({ loop: nextMode });
              }}
              aria-label={`Loop ${settings.loop}`}
              className={`relative p-2 rounded-full transition ${settings.loop !== "off" ? "text-blue-500 hc:bg-blue-500/20 hc:ring-2 hc:ring-blue-500/50 hc:text-blue-400" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hc:text-zinc-400"}`}
            >
              <Repeat className="w-6 h-6" />
              {settings.loop === "once" && (
                <span className="absolute top-1/2 left-1/2 text-[10px] font-bold bg-blue-500 text-white rounded-full min-w-4 h-4 flex items-center justify-center px-1">
                  1
                </span>
              )}
            </button>
          </div>

          <div className="flex justify-center gap-8 text-zinc-500 font-medium text-sm pb-8">
            <button
              onClick={skipBackward}
              className="hover:text-zinc-900 dark:hover:text-white flex items-center transition bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800"
            >
              -{settings.skipDuration}s
            </button>
            <button
              onClick={skipForward}
              className="hover:text-zinc-900 dark:hover:text-white flex items-center transition bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800"
            >
              +{settings.skipDuration}s
            </button>
          </div>
        </div>
      </div>
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
