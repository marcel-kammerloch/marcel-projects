"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { upload } from "@vercel/blob/client";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { createSong } from "@/actions/song";
import {
  X,
  Upload,
  Loader2,
  Music,
  Play,
  Square,
  Sliders,
  FileAudio,
} from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import type { Genre } from "@db/client";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import slugify from "slugify";
import SongMetadataForm from "./SongMetadataForm";
import AudioPreviewSection from "./AudioPreviewSection";

export default function UploadModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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

  const resetForm = useCallback(() => {
    setFile(null);
    setTitle("");
    setArtist("");
    setGenre("CLASSICAL");
    setStartTime("");
    setEndTime("");
    setDuration(0);
    setCurrentTime(0);
    setSpeed(1.0);
    setIsDraggingOver(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingPreview(false);
    setUploadStatus("");
    if (snippetTimeoutRef.current) {
      clearTimeout(snippetTimeoutRef.current);
    }
  }, []);

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
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingPreview(false);
        if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
      }
    } else {
      setMainIsPlaying(false);
    }
  }, [isOpen, setMainIsPlaying]);

  // Update preview playbackRate whenever speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const loadAudioFile = (selectedFile: File) => {
    setMainIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingPreview(false);
    }
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadAudioFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      loadAudioFile(droppedFile);
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
    setUploadStatus(t.upload.statusLoadingFFmpeg);
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

    setUploadStatus(t.upload.statusProcessing);
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
      toast.error(t.upload.titleRequired);
      return;
    }

    if (!file) {
      toast.error(t.upload.fileRequired);
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
      const filename = `${slugify(title, { locale: "de", lower: true, trim: true })}-${slugify(artist)}.mp3`;

      const hasStart = startTime !== "" && parseFloat(startTime) > 0;
      const hasEnd = endTime !== "" && parseFloat(endTime) < duration;
      const isM4A = file.name.toLowerCase().endsWith(".m4a");
      const hasSpeedChange = Math.abs(speed - 1.0) >= 0.005;

      if (hasStart || hasEnd || isM4A || hasSpeedChange) {
        const start = startTime !== "" ? parseFloat(startTime) : 0;
        const end = endTime !== "" ? parseFloat(endTime) : duration;
        const inputFormat = isM4A ? "m4a" : "mp3";

        finalBlob = await processAudio(
          finalBlob,
          start,
          end,
          speed,
          inputFormat,
        );
        finalDuration = Math.max(1, Math.round((end - start) / speed));
      }

      setUploadStatus(t.upload.statusUploading);
      const blobResult = await upload(filename, finalBlob, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      setUploadStatus(t.upload.statusSaving);
      await createSong({
        title,
        artist,
        genre,
        duration: finalDuration,
        path: blobResult.pathname,
      });

      toast.success(t.upload.uploadSuccess);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t.upload.uploadError(String(error)));
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-zinc-800 my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-zinc-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/10 text-blue-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
                {t.upload.modalTitle}
              </h2>
              <p className="text-xs text-zinc-400">{t.upload.modalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white p-1 rounded-full transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <form
            id="upload-audio-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* File Drop / Select Area with Interactive Drag Border */}
            {!file ? (
              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingOver(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDraggingOver(false);
                }}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
                  isDraggingOver
                    ? "border-blue-500 bg-blue-950/50 ring-4 ring-blue-500/25 shadow-lg shadow-blue-500/10 scale-[1.01]"
                    : "border-zinc-700 hover:border-blue-500 bg-zinc-950/20"
                }`}
              >
                <input
                  id="audio-upload"
                  type="file"
                  accept=".mp3,audio/mpeg,audio/mp3,.m4a,audio/x-m4a,audio/m4a,audio/mp4"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="flex flex-col items-center gap-2 pointer-events-none">
                  <div
                    className={`p-3 rounded-2xl transition-all ${
                      isDraggingOver
                        ? "bg-blue-600 text-white scale-110 shadow-md"
                        : "bg-blue-950/60 text-blue-400"
                    }`}
                  >
                    <FileAudio className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-zinc-200">
                      {isDraggingOver
                        ? t.upload.dropPromptActive
                        : t.upload.dropPrompt}
                    </span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {t.upload.supportsHint}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-blue-950/30 border border-blue-900/60 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                      {duration.toFixed(1)}s
                    </p>
                  </div>
                </div>

                <label
                  className="text-xs font-semibold text-blue-400 hover:underline cursor-pointer shrink-0 ml-2"
                  htmlFor="audio-upload"
                >
                  {t.upload.changeFile}
                  <input
                    type="file"
                    id="audio-upload"
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
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={togglePreview}
            disabled={!file || isUploading}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 cursor-pointer ${
              isPlayingPreview
                ? "bg-rose-600 text-white hover:bg-rose-500 shadow-sm"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-50"
            }`}
          >
            {isPlayingPreview ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                {t.upload.stopPreview}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                {t.upload.previewSelection}
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl font-medium text-sm text-zinc-400 hover:bg-zinc-800 transition cursor-pointer"
            >
              {t.common.cancel}
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
                  <span>
                    {uploadStatus || t.upload.statusGenericProcessing}
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{t.upload.processAndSave}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
