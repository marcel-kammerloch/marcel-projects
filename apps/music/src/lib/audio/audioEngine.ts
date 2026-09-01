import type { Song } from "@db/client";
import { getSongSource } from "@/components/player/playerUtils";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useSettingsStore } from "@/store/useSettingsStore";

type AudioEventListener = {
  onProgress?: (currentTime: number, duration: number) => void;
  onStateChange?: (isPlaying: boolean) => void;
  onSongChange?: (song: Song | null) => void;
};

class AudioEngine {
  private static instance: AudioEngine | null = null;

  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private isInitialized = false;
  private isSourceConnected = false;
  private listeners = new Set<AudioEventListener>();
  private loopedOnceForCurrentSong = false;
  private prefetchedSongId: string | null = null;

  private constructor() {
    // Audio element is initialized on client side
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init() {
    if (this.isInitialized || typeof window === "undefined") return;

    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.audio.preload = "auto";

    this.setupAudioEventListeners();
    this.setupMediaSession();
    this.setupUserGestureUnlock();

    this.isInitialized = true;
  }

  private setupUserGestureUnlock() {
    if (typeof window === "undefined") return;

    const unlock = () => {
      this.initWebAudioGraph();
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume().catch((err) => {
          console.warn("[AudioEngine] Could not resume AudioContext:", err);
        });
      }
    };

    window.addEventListener("click", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
  }

  private initWebAudioGraph() {
    if (typeof window === "undefined" || !this.audio || this.isSourceConnected)
      return;

    try {
      if (!this.audioContext) {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioContextClass) return;
        this.audioContext = new AudioContextClass();
      }

      if (!this.compressorNode || !this.gainNode || !this.analyserNode) {
        this.compressorNode = this.audioContext.createDynamicsCompressor();
        this.gainNode = this.audioContext.createGain();
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 128;
        this.analyserNode.smoothingTimeConstant = 0.8;

        const reduceDynamicRange =
          useSettingsStore.getState().settings.reduceDynamicRange;
        this.configureCompressor(reduceDynamicRange);
      }

      if (!this.isSourceConnected && this.audio) {
        this.sourceNode = this.audioContext.createMediaElementSource(
          this.audio,
        );
        this.sourceNode.connect(this.compressorNode);
        this.compressorNode.connect(this.gainNode);
        this.gainNode.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
        this.isSourceConnected = true;
      }
    } catch (err) {
      console.warn("[AudioEngine] Web Audio setup warning:", err);
    }
  }

  public configureCompressor(reduceRange: boolean) {
    if (!this.audioContext || !this.compressorNode || !this.gainNode) return;

    const time = this.audioContext.currentTime;
    if (reduceRange) {
      this.compressorNode.threshold.setTargetAtTime(-30, time, 0.05);
      this.compressorNode.knee.setTargetAtTime(20, time, 0.05);
      this.compressorNode.ratio.setTargetAtTime(4.0, time, 0.05);
      this.compressorNode.attack.setTargetAtTime(0.005, time, 0.05);
      this.compressorNode.release.setTargetAtTime(0.15, time, 0.05);
      this.gainNode.gain.setTargetAtTime(2.0, time, 0.05);
    } else {
      this.compressorNode.threshold.setTargetAtTime(0, time, 0.05);
      this.compressorNode.knee.setTargetAtTime(0, time, 0.05);
      this.compressorNode.ratio.setTargetAtTime(1.0, time, 0.05);
      this.compressorNode.attack.setTargetAtTime(0.003, time, 0.05);
      this.compressorNode.release.setTargetAtTime(0.25, time, 0.05);
      this.gainNode.gain.setTargetAtTime(1.0, time, 0.05);
    }
  }

  public getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  private setupAudioEventListeners() {
    if (!this.audio) return;

    this.audio.addEventListener("timeupdate", () => {
      if (!this.audio) return;
      const currentTime = this.audio.currentTime;
      const duration = this.audio.duration || 0;

      this.notifyProgress(currentTime, duration);
      this.updateMediaSessionPositionState(currentTime, duration);

      // Trigger pre-cache of next song when nearing the end (e.g. 15s or halfway)
      const settings = useSettingsStore.getState().settings;
      if (duration > 0 && !settings.saveBattery) {
        const remaining = duration - currentTime;
        const preloadThreshold = Math.min(15, duration / 2);
        if (remaining <= preloadThreshold && remaining > 0) {
          this.preloadNextTrack();
        }
      }
    });

    this.audio.addEventListener("play", () => {
      this.updateMediaSessionPlaybackState("playing");
      this.notifyStateChange(true);
      this.initWebAudioGraph();
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume().catch(() => {});
      }
      this.preloadNextTrack();
    });

    this.audio.addEventListener("pause", () => {
      // Only set paused if not transitioning to next track
      if (this.audio && this.audio.ended) return;
      this.updateMediaSessionPlaybackState("paused");
      this.notifyStateChange(false);
    });

    // CRITICAL FOR CONTINUOUS BACKGROUND PLAYBACK:
    // When track ends, synchronously select next track, swap src and call .play()
    // within the native onended event handler to prevent Chrome/Android from killing the foreground service.
    this.audio.addEventListener("ended", () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener("error", (e) => {
      console.error("[AudioEngine] Native audio error:", e);
      // Auto-recover if playback was interrupted in background
      const { isPlaying, queue } = usePlayerStore.getState();
      if (isPlaying && queue.length > 1) {
        console.log(
          "[AudioEngine] Recovering from error by advancing to next track...",
        );
        this.next();
      }
    });

    this.audio.addEventListener("stalled", () => {
      console.warn("[AudioEngine] Audio stream stalled, keeping alive...");
    });
  }

  private handleTrackEnded() {
    if (!this.audio) return;

    const { queue, playOnlyThisSong } = usePlayerStore.getState();
    const { settings } = useSettingsStore.getState();

    if (playOnlyThisSong) {
      usePlayerStore.setState({ playOnlyThisSong: false, isPlaying: false });
      this.updateMediaSessionPlaybackState("paused");
      this.notifyStateChange(false);
      return;
    }

    if (settings.loop === "once") {
      if (!this.loopedOnceForCurrentSong) {
        this.loopedOnceForCurrentSong = true;
        this.audio.currentTime = 0;
        this.audio
          .play()
          .catch((err) =>
            console.error("[AudioEngine] Replay once failed:", err),
          );
        return;
      }
    }

    if (settings.loop === "repeat" && queue.length === 1) {
      this.audio.currentTime = 0;
      this.audio
        .play()
        .catch((err) =>
          console.error("[AudioEngine] Repeat single failed:", err),
        );
      return;
    }

    const nextSong = this.getNextSongCandidate();
    if (nextSong) {
      this.loopedOnceForCurrentSong = false;
      this.playTrackDirectly(nextSong);
    } else {
      usePlayerStore.setState({ isPlaying: false });
      this.updateMediaSessionPlaybackState("paused");
      this.notifyStateChange(false);
    }
  }

  public getNextSongCandidate(): Song | null {
    const { currentSong, queue } = usePlayerStore.getState();
    const { settings } = useSettingsStore.getState();

    if (!currentSong || queue.length === 0) return null;

    if (settings.shuffle) {
      if (queue.length === 1) return queue[0];
      const otherSongs = queue.filter((s) => s.id !== currentSong.id);
      const randomIndex = Math.floor(Math.random() * otherSongs.length);
      return otherSongs[randomIndex] || queue[0];
    }

    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex === -1) return null;

    if (currentIndex === queue.length - 1) {
      return settings.loop === "repeat" ? queue[0] : null;
    }

    return queue[currentIndex + 1];
  }

  public getPreviousSongCandidate(): Song | null {
    const { currentSong, queue } = usePlayerStore.getState();
    if (!currentSong || queue.length === 0) return null;

    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex <= 0) {
      return queue[0];
    }
    return queue[currentIndex - 1];
  }

  /**
   * Synchronously swaps source, sets MediaSession, calls play(), and updates state.
   */
  private playTrackDirectly(song: Song) {
    if (!this.audio) return;

    this.initWebAudioGraph();
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }

    const src = getSongSource(song);
    this.prefetchedSongId = null;

    // Update MediaSession synchronously BEFORE play to keep Android Foreground Service active
    this.updateMediaSessionMetadata(song);
    this.updateMediaSessionPlaybackState("playing");

    this.audio.src = src;
    this.audio.playbackRate = song.speed ?? 1.0;
    this.audio.currentTime = 0;

    // Synchronously start playback
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("[AudioEngine] Playback promise error:", error);
      });
    }

    // Sync Zustand store
    usePlayerStore.setState({
      currentSong: song,
      isPlaying: true,
      playOnlyThisSong: false,
    });

    this.notifySongChange(song);
    this.notifyStateChange(true);

    // Pre-cache upcoming track
    this.preloadNextTrack();
  }

  public playSong(
    song: Song,
    queue?: Song[],
    playlistName: string | null = null,
    playbackSourceType: "playlist" | "genre" | null = null,
    playbackSourceName: string | null = null,
  ) {
    this.init();
    const currentQueue = queue ?? usePlayerStore.getState().queue;

    usePlayerStore.setState({
      queue: currentQueue.length > 0 ? currentQueue : [song],
      playlistName:
        playlistName !== undefined
          ? playlistName
          : usePlayerStore.getState().playlistName,
      playbackSourceType:
        playbackSourceType !== undefined
          ? playbackSourceType
          : usePlayerStore.getState().playbackSourceType,
      playbackSourceName:
        playbackSourceName !== undefined
          ? playbackSourceName
          : usePlayerStore.getState().playbackSourceName,
      playOnlyThisSong: false,
    });

    this.loopedOnceForCurrentSong = false;
    this.playTrackDirectly(song);
  }

  public resume() {
    this.init();
    if (!this.audio) return;

    const { currentSong } = usePlayerStore.getState();
    if (!currentSong) return;

    if (!this.audio.src || this.audio.src === "" || this.audio.ended) {
      this.playTrackDirectly(currentSong);
      return;
    }

    this.initWebAudioGraph();
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }

    this.audio.play().catch((err) => {
      console.warn("[AudioEngine] Resume failed, re-initiating track:", err);
      this.playTrackDirectly(currentSong);
    });

    usePlayerStore.setState({ isPlaying: true });
    this.updateMediaSessionPlaybackState("playing");
    this.notifyStateChange(true);
  }

  public pause() {
    if (!this.audio) return;
    this.audio.pause();
    usePlayerStore.setState({ isPlaying: false });
    this.updateMediaSessionPlaybackState("paused");
    this.notifyStateChange(false);
  }

  public togglePlay() {
    const { isPlaying, currentSong, queue } = usePlayerStore.getState();
    if (isPlaying) {
      this.pause();
    } else {
      if (!currentSong && queue.length > 0) {
        this.playSong(queue[0]);
      } else {
        this.resume();
      }
    }
  }

  public next() {
    const nextSong = this.getNextSongCandidate();
    if (nextSong) {
      this.loopedOnceForCurrentSong = false;
      this.playTrackDirectly(nextSong);
    } else {
      this.pause();
    }
  }

  public previous() {
    const prevSong = this.getPreviousSongCandidate();
    if (prevSong) {
      this.loopedOnceForCurrentSong = false;
      this.playTrackDirectly(prevSong);
    }
  }

  public seek(time: number) {
    if (!this.audio) return;
    this.audio.currentTime = time;
    this.notifyProgress(time, this.audio.duration || 0);
  }

  public skipForward(seconds: number) {
    if (!this.audio) return;
    const duration = this.audio.duration || 0;
    this.seek(Math.min(duration, this.audio.currentTime + seconds));
  }

  public skipBackward(seconds: number) {
    if (!this.audio) return;
    this.seek(Math.max(0, this.audio.currentTime - seconds));
  }

  public setPlaybackRate(rate: number) {
    if (!this.audio) return;
    this.audio.playbackRate = rate;
  }

  public setVolume(volume: number) {
    if (!this.audio) return;
    this.audio.volume = volume;
  }

  public preloadNextTrack() {
    if (typeof window === "undefined") return;

    const { settings } = useSettingsStore.getState();
    if (settings.saveBattery) return;

    const nextSong = this.getNextSongCandidate();
    if (!nextSong || nextSong.id === this.prefetchedSongId) return;

    this.prefetchedSongId = nextSong.id;
    const nextUrl = getSongSource(nextSong);

    // Send pre-cache message to Service Worker
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "PRECACHE_AUDIO",
        url: nextUrl,
      });
    } else if ("caches" in window) {
      // Fallback: precache directly into Cache Storage if SW controller is not yet ready
      caches
        .open("music-audio-cache-v1")
        .then((cache) => {
          cache.match(nextUrl).then((existing) => {
            if (!existing) {
              fetch(nextUrl, { mode: "cors" })
                .then((res) => {
                  if (res.ok) cache.put(nextUrl, res);
                })
                .catch(() => {});
            }
          });
        })
        .catch(() => {});
    }
  }

  private setupMediaSession() {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => this.resume());
    navigator.mediaSession.setActionHandler("pause", () => this.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () =>
      this.previous(),
    );
    navigator.mediaSession.setActionHandler("nexttrack", () => this.next());
    navigator.mediaSession.setActionHandler("stop", () => this.pause());

    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const skipTime =
        details.seekOffset ||
        useSettingsStore.getState().settings.skipDuration ||
        10;
      this.skipForward(skipTime);
    });

    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const skipTime =
        details.seekOffset ||
        useSettingsStore.getState().settings.skipDuration ||
        10;
      this.skipBackward(skipTime);
    });

    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime !== undefined) {
        this.seek(details.seekTime);
      }
    });
  }

  public updateMediaSessionMetadata(song: Song | null) {
    if (
      typeof window === "undefined" ||
      !("mediaSession" in navigator) ||
      !song
    )
      return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist || "Unknown Artist",
        album: song.genre || "Music",
        artwork: [
          {
            src: "/icons/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
    } catch (err) {
      console.warn("[AudioEngine] Error updating MediaSession metadata:", err);
    }
  }

  public updateMediaSessionPlaybackState(state: "playing" | "paused" | "none") {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch {
      // ignore
    }
  }

  public updateMediaSessionPositionState(
    currentTime: number,
    duration: number,
  ) {
    if (
      typeof window === "undefined" ||
      !("mediaSession" in navigator) ||
      !("setPositionState" in navigator.mediaSession) ||
      !duration ||
      isNaN(duration) ||
      duration <= 0
    ) {
      return;
    }

    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(duration, currentTime),
        playbackRate: this.audio?.playbackRate || 1,
        position: Math.min(currentTime, duration),
      });
    } catch {
      // ignore
    }
  }

  // Listener subscriptions for UI components
  public subscribe(listener: AudioEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyProgress(currentTime: number, duration: number) {
    for (const listener of this.listeners) {
      listener.onProgress?.(currentTime, duration);
    }
  }

  private notifyStateChange(isPlaying: boolean) {
    for (const listener of this.listeners) {
      listener.onStateChange?.(isPlaying);
    }
  }

  private notifySongChange(song: Song | null) {
    for (const listener of this.listeners) {
      listener.onSongChange?.(song);
    }
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public getDuration(): number {
    return this.audio?.duration || 0;
  }
}

export const audioEngine = AudioEngine.getInstance();
