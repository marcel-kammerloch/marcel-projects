import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LoopMode = "off" | "once" | "repeat";

export type Settings = {
  skipDuration: number;
  loop: LoopMode;
  shuffle: boolean;
  highContrast: boolean;
  keepScreenOn: boolean;
  reduceDynamicRange: boolean;
  saveBattery: boolean;
  reduceAnimations: boolean;
};

const normalizeLoopMode = (value: unknown): LoopMode => {
  if (value === "once" || value === "repeat") return value;
  return "off";
};

interface SettingsState {
  settings: Settings;
  setSettings: (newSettings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        skipDuration: 15,
        loop: "off",
        shuffle: false,
        highContrast: false,
        keepScreenOn: false,
        reduceDynamicRange: false,
        saveBattery: false,
        reduceAnimations: false,
      },

      setSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            loop: normalizeLoopMode(newSettings.loop ?? state.settings.loop),
          },
        })),
    }),
    {
      name: "music-settings-storage",
      merge: (persistedState, currentState) => {
        const mergedState = {
          ...currentState,
          ...(persistedState as Partial<SettingsState>),
        };

        if (mergedState.settings) {
          mergedState.settings = {
            ...mergedState.settings,
            loop: normalizeLoopMode(mergedState.settings.loop),
          };
        }

        return mergedState;
      },
    },
  ),
);
