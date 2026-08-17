"use client";

import { useEffect, useRef } from "react";

/*
ERROR:
 Failed to initialize Web Audio API: InvalidStateError: Failed to execute 'createMediaElementSource' on 'AudioContext': HTMLMediaElement already connected previously to a different MediaElementSourceNode.
  at initAudioEngine (src/components/Player.tsx:132:47)
  at Player.useEffect (src/components/Player.tsx:150:7)
  at RootLayout (src\app\layout.tsx:78:11)
130 |         }
131 |         globalAudioElement = audioRef.current;
132 |         globalSourceNode = globalAudioContext.createMediaElementSource(
    |                                               ^
133 |           audioRef.current,
134 |         );
135 | (src/components/Player.tsx:143:15)
*/

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  className?: string;
  barCount?: number;
}

export default function AudioVisualizer({
  analyser,
  isPlaying,
  className = "",
  barCount = 28,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedHeightsRef = useRef<number[]>(new Array(barCount).fill(4));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let bufferLength = 0;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;

    if (analyser) {
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
    }

    let phase = 0;

    const render = () => {
      if (!canvas || !ctx) return;

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

      const rawValues: number[] = new Array(barCount).fill(0);

      if (analyser && dataArray && isPlaying) {
        analyser.getByteFrequencyData(dataArray);

        // Sample frequencies across the spectrum with logarithmic-like weighting
        const step = Math.max(1, Math.floor(bufferLength / barCount));
        for (let i = 0; i < barCount; i++) {
          const index = Math.min(i * step, bufferLength - 1);
          // Frequency value 0-255
          const val = dataArray[index] || 0;
          // Scale to 0..1
          rawValues[i] = val / 255;
        }
      } else if (isPlaying) {
        // Fallback simulation if analyser not ready
        phase += 0.08;
        for (let i = 0; i < barCount; i++) {
          rawValues[i] =
            0.2 +
            0.3 * Math.sin(phase + i * 0.4) * Math.cos(phase * 0.5 + i * 0.2);
        }
      }

      const totalSpacing = width / barCount;
      const barWidth = Math.max(2.5, totalSpacing * 0.55);
      const minHeight = 3;
      const maxHeight = height - 4;

      for (let i = 0; i < barCount; i++) {
        const targetHeight = isPlaying
          ? Math.max(minHeight, rawValues[i] * maxHeight)
          : minHeight;

        // Smooth interpolation for fluid motion
        smoothedHeightsRef.current[i] =
          smoothedHeightsRef.current[i] * 0.7 + targetHeight * 0.3;

        const currentH = Math.max(minHeight, smoothedHeightsRef.current[i]);
        const x = i * totalSpacing + (totalSpacing - barWidth) / 2;
        const y = (height - currentH) / 2;

        // Rounded bar drawing
        const radius = barWidth / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + currentH);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.95)"); // blue-500
        gradient.addColorStop(0.5, "rgba(99, 102, 241, 0.85)"); // indigo-500
        gradient.addColorStop(1, "rgba(147, 51, 234, 0.75)"); // purple-600

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, currentH, radius);
        ctx.fill();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isPlaying, barCount]);

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-10 rounded-xl"
        style={{ width: "100%", height: "40px" }}
      />
    </div>
  );
}
