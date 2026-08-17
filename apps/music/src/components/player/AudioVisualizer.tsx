"use client";

import { useEffect, useRef } from "react";

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
  barCount = 32,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedHeightsRef = useRef<number[]>(new Array(barCount).fill(4));
  const dynamicMaxRef = useRef<number>(120);

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
      const halfCount = Math.floor(barCount / 2);

      if (analyser && dataArray && isPlaying) {
        analyser.getByteFrequencyData(dataArray);

        // Calculate overall loudness / RMS energy for baseline pulse
        let totalEnergy = 0;
        let maxEnergy = 0;
        for (let i = 0; i < bufferLength; i++) {
          totalEnergy += dataArray[i];
          if (dataArray[i] > maxEnergy) maxEnergy = dataArray[i];
        }
        const avgEnergy = totalEnergy / (bufferLength || 1);

        // Dynamic AGC adaptation
        dynamicMaxRef.current = Math.max(
          80,
          dynamicMaxRef.current * 0.96 + maxEnergy * 0.04,
        );
        const normFactor = dynamicMaxRef.current || 120;

        // Equalized center-outward frequency mapping:
        // Center bars get the low/punchy frequencies, radiating outward to mid and highs
        for (let i = 0; i < barCount; i++) {
          // Distance from center (0 at middle, 1 at edges)
          const distFromCenter = Math.abs(i - (barCount - 1) / 2);
          const normalizedDist = distFromCenter / (halfCount || 1);

          // Bin selection radiating outward
          const binIndex = Math.min(
            bufferLength - 1,
            Math.floor(normalizedDist * (bufferLength * 0.75)),
          );

          const rawFreq = dataArray[binIndex] || 0;

          // Equalization tilt: boost higher frequencies to compensate for natural roll-off
          const eqBoost = 1.0 + normalizedDist * 1.6;
          const weightedFreq = Math.min(255, rawFreq * eqBoost);

          // Blend frequency peak with general track pulse for lively response everywhere
          const blendedValue = (weightedFreq * 0.75 + avgEnergy * 0.45) / normFactor;
          const subtleWave =
            0.08 * Math.sin(phase + i * 0.3) + 0.04 * Math.cos(phase * 1.5 - i * 0.2);

          rawValues[i] = Math.max(0.08, Math.min(1.0, blendedValue + subtleWave));
        }

        phase += 0.06;
      } else if (isPlaying) {
        // Fallback smooth ambient wave when analyser is warming up
        phase += 0.08;
        for (let i = 0; i < barCount; i++) {
          const dist = Math.abs(i - (barCount - 1) / 2) / halfCount;
          const centerArch = 1 - dist * 0.4;
          rawValues[i] =
            0.2 +
            0.35 *
              centerArch *
              Math.abs(Math.sin(phase + i * 0.35) * Math.cos(phase * 0.7 + i * 0.15));
        }
      }

      const totalSpacing = width / barCount;
      const barWidth = Math.max(2.2, totalSpacing * 0.58);
      const minHeight = 3.5;
      const maxHeight = height - 4;

      for (let i = 0; i < barCount; i++) {
        const targetHeight = isPlaying
          ? Math.max(minHeight, rawValues[i] * maxHeight)
          : minHeight;

        // Smooth physics: fast attack, smooth decay
        const prev = smoothedHeightsRef.current[i] || minHeight;
        if (targetHeight > prev) {
          smoothedHeightsRef.current[i] = prev * 0.3 + targetHeight * 0.7;
        } else {
          smoothedHeightsRef.current[i] = prev * 0.78 + targetHeight * 0.22;
        }

        const currentH = Math.max(minHeight, smoothedHeightsRef.current[i]);
        const x = i * totalSpacing + (totalSpacing - barWidth) / 2;
        const y = (height - currentH) / 2;
        const radius = barWidth / 2;

        // Dynamic center-outward color gradient
        const distFromCenter = Math.abs(i - (barCount - 1) / 2) / halfCount;
        const gradient = ctx.createLinearGradient(0, y, 0, y + currentH);

        if (distFromCenter < 0.35) {
          // Center: punchy electric blue & cyan
          gradient.addColorStop(0, "rgba(56, 189, 248, 0.95)"); // sky-400
          gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.9)"); // blue-500
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.85)"); // indigo-500
        } else if (distFromCenter < 0.7) {
          // Mid: vibrant indigo & blue
          gradient.addColorStop(0, "rgba(96, 165, 250, 0.9)"); // blue-400
          gradient.addColorStop(0.5, "rgba(129, 140, 248, 0.85)"); // indigo-400
          gradient.addColorStop(1, "rgba(168, 85, 247, 0.8)"); // purple-500
        } else {
          // Outer edges: violet & purple glow
          gradient.addColorStop(0, "rgba(147, 51, 234, 0.85)"); // purple-600
          gradient.addColorStop(0.5, "rgba(168, 85, 247, 0.8)"); // purple-500
          gradient.addColorStop(1, "rgba(192, 132, 252, 0.75)"); // purple-400
        }

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
        className="w-full h-11 rounded-xl"
        style={{ width: "100%", height: "44px" }}
      />
    </div>
  );
}
