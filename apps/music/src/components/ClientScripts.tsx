"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";

export function ClientScripts() {
  const highContrast = usePlayerStore((state) => state.settings?.highContrast);

  useEffect(() => {
    // useEffect only runs on the client, eliminating the need for a separate `mounted` check
    document.documentElement.classList.toggle(
      "high-contrast",
      Boolean(highContrast),
    );
  }, [highContrast]);

  return null;
}
