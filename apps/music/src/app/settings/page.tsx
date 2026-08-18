"use client";

import { useState } from "react";
import { usePlayerStore } from "@/store/usePlayerStore";
import {
  ArrowLeft,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ToggleSettingProps = {
  title: React.ReactNode;
  description: string;
  border?: boolean;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function ToggleSetting({
  title,
  description,
  border,
  checked,
  onChange,
}: ToggleSettingProps) {
  return (
    <div className={`pt-6 border-zinc-800 flex items-center justify-between ${border ? "border-t" : ""}`}>
      <div>
        <h3 className="text-base font-medium text-zinc-100 block">
          {title}
        </h3>
        <p className="text-sm text-zinc-500 mt-1">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, setSettings } = usePlayerStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const playbackSettings = [
    {
      title: "Keep Screen On",
      description:
        "When enabled in the installed app, keep the screen awake while audio plays.",
      checked: settings.keepScreenOn,
      onChange: (checked: boolean) => setSettings({ keepScreenOn: checked }),
    },
    {
      title: "Save battery",
      description:
        "When enabled, the visualizer stays off and the next song is not preloaded in advance.",
      checked: settings.saveBattery,
      onChange: (checked: boolean) => setSettings({ saveBattery: checked }),
    },
    {
      title: "Reduce Dynamic Range",
      description:
        "Compresses the volume differences within a song to make loud and quiet parts more balanced.",
      checked: settings.reduceDynamicRange,
      onChange: (checked: boolean) =>
        setSettings({ reduceDynamicRange: checked }),
    },
  ];

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    try {
      localStorage.clear();
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      window.location.href = "/";
    } catch (error) {
      console.error("Reset failed", error);
      toast.error("Reset failed: " + String(error));
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-4">
      <div className="flex items-center gap-4 py-6">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-800/50">
          <ArrowLeft className="w-6 h-6 text-zinc-100" />
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
      </div>

      <div className="gap-8 my-4 flex items-center flex-col">
        <section className="w-full max-w-4xl">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Playback
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-6">
            <label
              className="text-base font-medium text-zinc-100 block mb-4"
              htmlFor="duration-btns"
            >
              Fast-Forward & Rewind Duration
            </label>
            <div
              className="flex gap-2 bg-zinc-950 p-1.5 rounded-xl"
              id="duration-btns"
            >
              {[10, 15, 30].map((val) => (
                <button
                  key={val}
                  onClick={() => setSettings({ skipDuration: val })}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-semibold text-sm transition",
                    settings.skipDuration === val
                      ? "bg-zinc-800 text-white shadow-sm border border-zinc-700"
                      : "text-zinc-400 hover:text-white",
                  )}
                >
                  {val}s
                </button>
              ))}
            </div>

            {playbackSettings.map((setting) => (
              <ToggleSetting
                key={setting.title}
                title={setting.title}
                description={setting.description}
                checked={setting.checked}
                onChange={setting.onChange}
                border
              />
            ))}
          </div>
        </section>

        <section className="w-full max-w-4xl">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Appearance
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 pb-5 space-y-6 shadow-sm">
            <ToggleSetting
              title={"High Contrast Mode"}
              description="Enhances visibility of active elements."
              checked={settings.highContrast}
              onChange={(checked) => setSettings({ highContrast: checked })}
            />
            <ToggleSetting
              title={"Reduce Animations"}
              description="Turn off most of the animation."
              border
              checked={settings.reduceAnimations}
              onChange={(checked) => setSettings({ reduceAnimations: checked })}
            />
          </div>
        </section>

        <section className="w-full max-w-4xl md:mb-8">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Data Management
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <button
              onClick={handleReset}
              className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Reset App
            </button>
            <p className="text-xs text-center text-zinc-500 mt-4">
              This will reset your preferences.
            </p>
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Reset Settings"
        description="Are you sure you want to reset settings? This action will clear all local data and preferences."
        onConfirm={confirmReset}
        confirmText="Reset"
        isDestructive={true}
      />
    </div>
  );
}
