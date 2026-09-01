"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { audioEngine } from "@/lib/audio/audioEngine";

export function ClientScripts() {
  const highContrast = useSettingsStore((state) => state.settings.highContrast);

  useEffect(() => {
    // Toggle high contrast theme
    document.documentElement.classList.toggle(
      "high-contrast",
      Boolean(highContrast),
    );
  }, [highContrast]);

  useEffect(() => {
    // Initialize audio engine singleton
    audioEngine.init();

    // Register Service Worker for audio caching and HTTP 206 Range support
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          registration.update().catch(() => {});
        })
        .catch((error) => {
          console.warn("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}

