"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";

export function ClientScripts() {
  const highContrast = useSettingsStore((state) => state.settings.highContrast);

  useEffect(() => {
    // useEffect only runs on the client, eliminating the need for a separate `mounted` check
    document.documentElement.classList.toggle(
      "high-contrast",
      Boolean(highContrast),
    );
  }, [highContrast]);

  return null;
}
