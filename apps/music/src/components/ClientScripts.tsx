"use client";

import { useEffect, useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";

export function ClientScripts() {
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

  // useEffect(() => {
  //   if ("serviceWorker" in navigator) {
  //     navigator.serviceWorker
  //       .getRegistrations()
  //       .then((registrations) =>
  //         Promise.all(
  //           registrations.map((registration) => registration.unregister()),
  //         ),
  //       )
  //       .catch((error) =>
  //         console.error("Failed to unregister service workers", error),
  //       );
  //   }

  //   if ("caches" in window) {
  //     caches
  //       .keys()
  //       .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
  //       .catch((error) => console.error("Failed to clear caches", error));
  //   }
  // }, []);

  return null;
}
