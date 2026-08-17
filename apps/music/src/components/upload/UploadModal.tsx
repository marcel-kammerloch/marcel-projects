"use client";

import { useState, useRef, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { createSong } from "@/actions/song";
import { X, Upload, Loader2, Music, Play, Square, Sliders, FileAudio } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import type { Genre } from "@db/client";
import { toast } from "sonner";

import SongMetadataForm from "./SongMetadataForm";
import AudioPreviewSection from "./AudioPreviewSection";

export default function UploadModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState<Genre>("CLASSICAL");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { setIsPlaying: setMainIsPlaying } = usePlayerStore();
  const snippetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    ffmpegRef.current = new FFmpeg();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingPreview(false);
      if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
    } else if (isOpen) {
      setMainIsPlaying(false);
    }
  }, [isOpen, setMainIsPlaying]);

  // Update preview playbackRate whenever speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlayingPreview(false);
      }
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      setCurrentTime(0);
      setStartTime("");
      setEndTime("");
      setSpeed(1.0);

      const audio = new Audio(URL.createObjectURL(selectedFile));
      audio.onloadedmetadata = () => {
        const preciseDuration = Math.round(audio.duration * 10) / 10;
        setDuration(preciseDuration);
      };
    }
  };

  const syncTime = () => {
    if (audioRef.current) {
      const cur = Math.round(audioRef.current.currentTime * 10) / 10;
      setCurrentTime(cur);

      const endLimit = endTime !== "" ? parseFloat(endTime) : duration;
      if (endLimit > 0 && cur >= endLimit) {
        audioRef.current.pause();
        setIsPlayingPreview(false);
        if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
      }
    }
  };

  const getOrCreateAudio = () => {
    if (!file) return null;
    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(file));
      audioRef.current.addEventListener("timeupdate", syncTime);
      audioRef.current.onended = () => setIsPlayingPreview(false);
    }
    audioRef.current.playbackRate = speed;
    return audioRef.current;
  };

  const togglePreview = () => {
    if (isPlayingPreview) {
      audioRef.current?.pause();
      setIsPlayingPreview(false);
      if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
      return;
    }

    const audio = getOrCreateAudio();
    if (!audio) return;

    const start = startTime !== "" ? parseFloat(startTime) : 0;
    const end = endTime !== "" ? parseFloat(endTime) : duration;

    if (audio.currentTime < start || (end > 0 && audio.currentTime >= end)) {
      audio.currentTime = start;
    }

    audio.playbackRate = speed;
    audio.play().catch((e) => console.error("Preview play failed:", e));
    setIsPlayingPreview(true);
  };

  const playSnippet = (seekTime: number, durationLimit: number = 5) => {
    if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);

    const audio = getOrCreateAudio();
    if (!audio) return;

    audio.currentTime = Math.max(0, seekTime);
    audio.playbackRate = speed;
    audio.play().catch((e) => console.error("Snippet play failed:", e));
    setIsPlayingPreview(true);

    const effectiveTimeoutMs = (durationLimit / speed) * 1000;
    snippetTimeoutRef.current = setTimeout(() => {
      audio.pause();
      setIsPlayingPreview(false);
    }, effectiveTimeoutMs);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSetStart = () => {
    if (audioRef.current) {
      const cur = Math.round(audioRef.current.currentTime * 10) / 10;
      setStartTime(cur.toFixed(1));
    }
  };

  const handleSetEnd = () => {
    if (audioRef.current) {
      const cur = Math.round(audioRef.current.currentTime * 10) / 10;
      setEndTime(cur.toFixed(1));
    }
  };

  const processAudio = async (
    inputBlob: Blob,
    start: number,
    end: number,
    targetSpeed: number,
    inputFormat: string,
  ) => {
    setUploadStatus("Loading FFmpeg audio engine...");
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) throw new Error("FFmpeg not initialized");

    if (!ffmpeg.loaded) {
      await ffmpeg.load({
        coreURL:
          "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
        wasmURL:
          "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
      });
    }

    setUploadStatus("Processing audio with studio filter...");
    const inputExt = inputFormat.includes("m4a") ? "m4a" : "mp3";
    const inputName = `input.${inputExt}`;
    await ffmpeg.writeFile(inputName, await fetchFile(inputBlob));

    const rawTrimDuration = end - start;
    const args: string[] = ["-i", inputName];

    if (start > 0) {
      args.push("-ss", start.toFixed(1));
    }
    if (end > 0 && end < 1000000 && rawTrimDuration > 0) {
      args.push("-t", rawTrimDuration.toFixed(1));
    }

    // Pitch-preserving tempo adjustment via atempo filter
    if (Math.abs(targetSpeed - 1.0) >= 0.005) {
      args.push("-af", `atempo=${targetSpeed.toFixed(2)}`);
    }

    args.push("-c:a", "libmp3lame", "-q:a", "2", "output.mp3");

    await ffmpeg.exec(args);

    const fileData = await ffmpeg.readFile("output.mp3");
    const data = new Uint8Array(fileData as unknown as ArrayBuffer);
    return new Blob([data.buffer], { type: "audio/mpeg" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error("Title is required");
      return;
    }

    if (!file) {
      toast.error("Please select an audio file to upload");
      return;
    }

    setIsUploading(true);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingPreview(false);
    }

    try {
      let finalBlob: Blob = file;
      let finalDuration = duration;
      const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${artist.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.mp3`;

      const hasStart = startTime !== "" && parseFloat(startTime) > 0;
      const hasEnd = endTime !== "" && parseFloat(endTime) < duration;
      const isM4A = file.name.toLowerCase().endsWith(".m4a");
      const hasSpeedChange = Math.abs(speed - 1.0) >= 0.005;

      if (hasStart || hasEnd || isM4A || hasSpeedChange) {
        const start = startTime !== "" ? parseFloat(startTime) : 0;
        const end = endTime !== "" ? parseFloat(endTime) : duration;
        const inputFormat = isM4A ? "m4a" : "mp3";

        finalBlob = await processAudio(finalBlob, start, end, speed, inputFormat);
        finalDuration = Math.max(1, Math.round((end - start) / speed));
      }

      setUploadStatus("Uploading to cloud storage...");
      const blobResult = await upload(filename, finalBlob, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      setUploadStatus("Saving track to library...");
      await createSong({
        title,
        artist,
        genre,
        duration: finalDuration,
        path: blobResult.pathname,
      });

      toast.success("Song uploaded successfully!");
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + String(error));
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                Studio Audio Editor & Upload
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Trim with 0.1s precision and change tempo with pitch preservation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <form id="upload-audio-form" onSubmit={handleSubmit} className="space-y-5">
            {/* File Drop / Select Area */}
            {!file ? (
              <div className="relative border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center transition bg-zinc-50/50 dark:bg-zinc-950/20">
                <input
                  id="audio-upload"
                  type="file"
                  accept=".mp3,audio/mpeg,audio/mp3,.m4a,audio/x-m4a,audio/m4a,audio/mp4"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <FileAudio className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Choose an audio file or drag & drop
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Supports MP3, M4A, AAC
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {duration.toFixed(1)}s
                    </p>
                  </div>
                </div>

                <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0 ml-2">
                  Change
                  <input
                    type="file"
                    accept=".mp3,audio/mpeg,audio/mp3,.m4a,audio/x-m4a,audio/m4a,audio/mp4"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
            )}

            {/* Song Metadata Details */}
            <SongMetadataForm
              title={title}
              setTitle={setTitle}
              artist={artist}
              setArtist={setArtist}
              genre={genre}
              setGenre={setGenre}
            />

            {/* Advanced Trimming & Speed Editor */}
            <AudioPreviewSection
              file={file}
              duration={duration}
              currentTime={currentTime}
              startTime={startTime}
              endTime={endTime}
              speed={speed}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
              setSpeed={setSpeed}
              handleSeek={handleSeek}
              handleSetStart={handleSetStart}
              handleSetEnd={handleSetEnd}
              playSnippet={playSnippet}
              fileSelected={!!file}
            />
          </form>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={togglePreview}
            disabled={!file || isUploading}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 cursor-pointer ${
              isPlayingPreview
                ? "bg-rose-600 text-white hover:bg-rose-500 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 disabled:opacity-50"
            }`}
          >
            {isPlayingPreview ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                Stop Preview
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Preview Selection
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl font-medium text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="upload-audio-form"
              disabled={!file || isUploading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadStatus || "Processing..."}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Process & Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
