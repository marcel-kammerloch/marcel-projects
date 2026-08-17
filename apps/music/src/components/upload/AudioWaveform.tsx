"use client";

import { useEffect, useRef, useState, useMemo } from "react";

interface AudioWaveformProps {
  file: File | null;
  duration: number;
  currentTime: number;
  startTime: number;
  endTime: number;
  onSeek: (time: number) => void;
  onStartChange: (time: number) => void;
  onEndChange: (time: number) => void;
}

export default function AudioWaveform({
  file,
  duration,
  currentTime,
  startTime,
  endTime,
  onSeek,
  onStartChange,
  onEndChange,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [isDecoding, setIsDecoding] = useState(false);
  const draggingRef = useRef<"start" | "end" | "scrub" | null>(null);

  // Decode audio data to extract waveform peaks
  useEffect(() => {
    if (!file) {
      setPeaks([]);
      return;
    }

    let isMounted = true;
    setIsDecoding(true);

    const extractPeaks = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        const tempCtx = new AudioContextClass();
        const audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);

        if (!isMounted) {
          tempCtx.close();
          return;
        }

        const channelData = audioBuffer.getChannelData(0);
        const samples = 140; // Number of bars to render
        const blockSize = Math.floor(channelData.length / samples);
        const extracted: number[] = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          const start = i * blockSize;
          const end = Math.min(start + blockSize, channelData.length);
          for (let j = start; j < end; j++) {
            sum += Math.abs(channelData[j]);
          }
          const avg = sum / (end - start);
          extracted.push(avg);
        }

        // Normalize peaks between 0.1 and 1.0
        const maxPeak = Math.max(...extracted, 0.01);
        const normalized = extracted.map((p) =>
          Math.max(0.12, Math.min(1.0, (p / maxPeak) * 0.95)),
        );

        setPeaks(normalized);
        tempCtx.close();
      } catch (err) {
        console.error("Waveform extraction fallback:", err);
        // Fallback placeholder peaks
        const fallback = Array.from({ length: 140 }, (_, i) =>
          Math.max(0.15, 0.5 + 0.4 * Math.sin(i * 0.15) * Math.cos(i * 0.3)),
        );
        setPeaks(fallback);
      } finally {
        if (isMounted) setIsDecoding(false);
      }
    };

    extractPeaks();

    return () => {
      isMounted = false;
    };
  }, [file]);

  // Draw waveform onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (peaks.length === 0) {
      ctx.fillStyle = "rgba(113, 113, 122, 0.2)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        isDecoding ? "Generating studio waveform..." : "Audio waveform",
        width / 2,
        height / 2,
      );
      ctx.restore();
      return;
    }

    const safeDuration = duration > 0 ? duration : 1;
    const startRatio = Math.max(0, Math.min(1, startTime / safeDuration));
    const effectiveEnd = endTime > 0 ? endTime : safeDuration;
    const endRatio = Math.max(startRatio, Math.min(1, effectiveEnd / safeDuration));
    const currentRatio = Math.max(0, Math.min(1, currentTime / safeDuration));

    const totalBars = peaks.length;
    const barSpacing = width / totalBars;
    const barWidth = Math.max(1.8, barSpacing * 0.65);

    // 1. Draw bars
    peaks.forEach((peak, i) => {
      const barRatio = i / totalBars;
      const isInSelection = barRatio >= startRatio && barRatio <= endRatio;
      const isPastPlayhead = barRatio <= currentRatio;

      const barHeight = peak * (height - 16);
      const x = i * barSpacing + (barSpacing - barWidth) / 2;
      const y = (height - barHeight) / 2;
      const radius = barWidth / 2;

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, radius);

      if (isInSelection) {
        if (isPastPlayhead) {
          ctx.fillStyle = "#3b82f6"; // blue-500
        } else {
          ctx.fillStyle = "rgba(96, 165, 250, 0.7)"; // blue-400
        }
      } else {
        ctx.fillStyle = "rgba(113, 113, 122, 0.3)"; // zinc-500 dimmed
      }
      ctx.fill();
    });

    // 2. Draw active trim overlay & handles
    const startX = startRatio * width;
    const endX = endRatio * width;
    const playheadX = currentRatio * width;

    // Selection border top & bottom
    ctx.strokeStyle = "rgba(59, 130, 246, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startX, 2);
    ctx.lineTo(endX, 2);
    ctx.moveTo(startX, height - 2);
    ctx.lineTo(endX, height - 2);
    ctx.stroke();

    // Start Trim Handle (Green / Blue accent)
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.roundRect(startX - 2, 0, 4, height, 2);
    ctx.fill();

    // Start handle knob
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(startX - 5, 2, 10, 14, 3);
    ctx.fill();

    // End Trim Handle (Blue / Indigo accent)
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.roundRect(endX - 2, 0, 4, height, 2);
    ctx.fill();

    // End handle knob
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.roundRect(endX - 5, height - 16, 10, 14, 3);
    ctx.fill();

    // 3. Playhead cursor
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.fillRect(playheadX - 1, 0, 2, height);

    ctx.restore();
  }, [peaks, isDecoding, duration, currentTime, startTime, endTime]);

  const getTimeFromPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration <= 0) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = x / rect.width;
    return Math.round(ratio * duration * 10) / 10;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration <= 0) return;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const safeDuration = duration > 0 ? duration : 1;
    const startX = (startTime / safeDuration) * rect.width;
    const effectiveEnd = endTime > 0 ? endTime : safeDuration;
    const endX = (effectiveEnd / safeDuration) * rect.width;

    if (Math.abs(x - startX) <= 12) {
      draggingRef.current = "start";
    } else if (Math.abs(x - endX) <= 12) {
      draggingRef.current = "end";
    } else {
      draggingRef.current = "scrub";
      const time = getTimeFromPointer(e);
      onSeek(time);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current || duration <= 0) return;
    const time = getTimeFromPointer(e);

    if (draggingRef.current === "start") {
      const maxLimit = endTime > 0 ? endTime - 0.1 : duration;
      onStartChange(Math.max(0, Math.min(maxLimit, time)));
    } else if (draggingRef.current === "end") {
      const minLimit = startTime + 0.1;
      onEndChange(Math.max(minLimit, Math.min(duration, time)));
    } else if (draggingRef.current === "scrub") {
      onSeek(time);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="w-full select-none">
      <div className="relative w-full h-24 bg-zinc-900/90 dark:bg-zinc-950 rounded-xl p-2 border border-zinc-800 shadow-inner overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full block touch-none"
        />
      </div>
    </div>
  );
}
