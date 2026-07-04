"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import OfflinePage from "@/app/offline/page";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { settings } = usePlayerStore();

  useEffect(() => {
    setMounted(true);
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations.map((registration) => registration.unregister()),
          ),
        )
        .catch((error) =>
          console.error("Failed to unregister service workers", error),
        );
    }

    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch((error) => console.error("Failed to clear caches", error));
    }
  }, []);

  // To prevent hydration mismatch, you could return null before mount,
  // but next-themes handles hydration natively.
  // The highContrast class is handled purely on client after mount.

  if (!mounted) {
    return null;
  }

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  );
}

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // React 19 / Next 16 fix: suppress the <script> tag warning by
  // telling next-themes to use type="application/json" instead of
  // type="text/javascript", which React won't try to execute
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  );
}
