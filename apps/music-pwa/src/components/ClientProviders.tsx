"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { settings } = usePlayerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (settings.highContrast) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
    }
  }, [mounted, settings.highContrast]);

  // To prevent hydration mismatch, you could return null before mount,
  // but next-themes handles hydration natively.
  // The highContrast class is handled purely on client after mount.

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  );
}
