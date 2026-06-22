"use client";

import { useState, useRef, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { createSong } from "@/actions/song";
import { X, Upload, Loader2, Music, Play } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import type { Genre } from "@db/client";

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
      const audio = new Audio(URL.createObjectURL(selectedFile));
      audio.onloadedmetadata = () => {
        setDuration(Math.floor(audio.duration));
      };
    }
  };

  const syncTime = () => {
    if (audioRef.current) {
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const togglePreview = () => {
    if (isPlayingPreview) {
      audioRef.current?.pause();
      setIsPlayingPreview(false);
      if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);
      return;
    }

    if (!file) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(file));
      audioRef.current.addEventListener("timeupdate", syncTime);
      audioRef.current.onended = () => setIsPlayingPreview(false);
    }

    const start = startTime !== "" ? parseInt(startTime) : 0;
    const audio = audioRef.current;

    if (Math.abs(audio.currentTime - start) > 1 && audio.currentTime < start) {
      audio.currentTime = start;
    }

    audio.play();
    setIsPlayingPreview(true);
  };

  const playSnippet = (seekTime: number, durationLimit: number = 5) => {
    if (!file) return;

    if (snippetTimeoutRef.current) clearTimeout(snippetTimeoutRef.current);

    if (!audioRef.current) {
      audioRef.current = new Audio(URL.createObjectURL(file));
      audioRef.current.addEventListener("timeupdate", syncTime);
      audioRef.current.onended = () => setIsPlayingPreview(false);
    }

    const audio = audioRef.current;
    audio.currentTime = seekTime;
    audio.play();
    setIsPlayingPreview(true);

    snippetTimeoutRef.current = setTimeout(() => {
      audio.pause();
      setIsPlayingPreview(false);
    }, durationLimit * 1000);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSetStart = () => {
    if (audioRef.current) {
      setStartTime(Math.floor(audioRef.current.currentTime).toString());
    }
  };

  const handleSetEnd = () => {
    if (audioRef.current) {
      setEndTime(Math.floor(audioRef.current.currentTime).toString());
    }
  };

  const processAudio = async (
    inputBlob: Blob,
    start: number,
    end: number,
    inputFormat: string,
  ) => {
    setUploadStatus("Loading FFmpeg...");
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

    setUploadStatus("Processing audio...");
    const inputExt = inputFormat.includes("m4a") ? "m4a" : "mp3";
    const inputName = `input.${inputExt}`;
    await ffmpeg.writeFile(inputName, await fetchFile(inputBlob));

    const duration = end - start;
    const args = ["-i", inputName];

    if (start > 0) {
      args.push("-ss", start.toString());
    }
    if (end > 0 && end < 1000000) {
      args.push("-t", duration.toString());
    }

    args.push("-c:a", "libmp3lame", "-q:a", "2", "output.mp3");

    await ffmpeg.exec(args);

    const fileData = await ffmpeg.readFile("output.mp3");
    const data = new Uint8Array(fileData as unknown as ArrayBuffer);
    return new Blob([data.buffer], { type: "audio/mpeg" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Title is required");

    setIsUploading(true);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingPreview(false);
    }

    try {
      let finalBlob: Blob;
      let finalDuration = duration;
      const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${artist.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.mp3`;

      if (!file) throw new Error("No file selected");
      finalBlob = file;

      const hasStart = startTime !== "";
      const hasEnd = endTime !== "";
      const isM4A = file.name.toLowerCase().endsWith(".m4a");

      if (hasStart || hasEnd || isM4A) {
        const start = hasStart ? parseInt(startTime) : 0;
        const end = hasEnd ? parseInt(endTime) : duration;

        const inputFormat = isM4A ? "m4a" : "mp3";
        finalBlob = await processAudio(finalBlob, start, end, inputFormat);
        finalDuration = end - start;
      }

      setUploadStatus("Uploading to Blob Storage...");
      const blobResult = await upload(filename, finalBlob, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      setUploadStatus("Saving to database...");
      await createSong({
        title,
        artist,
        genre,
        duration: finalDuration,
        url: blobResult.url,
      });

      onClose();
    } catch (error) {
      alert("Error: " + String(error));
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">Upload Audio</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="audio-upload" className="sr-only">Upload Audio File</label>
              <input
                id="audio-upload"
                type="file"
                accept=".mp3,audio/mpeg,audio/mp3,.m4a,audio/x-m4a,audio/m4a,audio/mp4"
                onChange={handleFileUpload}
                className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600/20 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-600/30 transition cursor-pointer"
                required
              />
            </div>

            <SongMetadataForm
              title={title}
              setTitle={setTitle}
              artist={artist}
              setArtist={setArtist}
              genre={genre}
              setGenre={setGenre}
            />

            <AudioPreviewSection
              duration={duration}
              currentTime={currentTime}
              startTime={startTime}
              endTime={endTime}
              setStartTime={setStartTime}
              setEndTime={setEndTime}
              handleSeek={handleSeek}
              handleSetStart={handleSetStart}
              handleSetEnd={handleSetEnd}
              playSnippet={playSnippet}
              fileSelected={!!file}
            />

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={togglePreview}
                disabled={!file || isUploading}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPlayingPreview ? (
                  <>
                    <X className="w-5 h-5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5" />
                    Preview
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="flex-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {uploadStatus}
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Save Audio
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
