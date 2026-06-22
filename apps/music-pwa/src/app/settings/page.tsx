"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { useTheme } from "next-themes";
import { ArrowLeft, Monitor, Moon, Sun, Trash2, Contrast } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { settings, setSettings } = usePlayerStore();
  const { theme, setTheme } = useTheme();

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset settings?")) {
      try {
        localStorage.clear();
        window.location.href = "/";
      } catch (e) {
        console.error("Reset failed", e);
        alert("Reset failed: " + String(e));
      }
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

      <div className="gap-8 my-4 flex items-center flex-col overflow-y-scroll">
        {/* Playback Settings */}
        <section className="w-full max-w-4xl">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Playback
          </h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <label className="text-base font-medium text-zinc-900 dark:text-zinc-100 block mb-4">
              Fast-Forward & Rewind Duration
            </label>
            <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-950 p-1.5 rounded-xl">
              {[10, 15, 30].map((val) => (
                <button
                  key={val}
                  onClick={() => setSettings({ skipDuration: val })}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition ${
                    settings.skipDuration === val
                      ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {val}s
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Appearance Settings */}
        <section className="w-full max-w-4xl">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Appearance
          </h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-6">
            <div>
              <label className="text-base font-medium text-zinc-900 dark:text-zinc-100 block mb-4">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition ${theme === "system" ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-400" : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"}`}
                >
                  <Monitor className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">System</span>
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition ${theme === "light" ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-400" : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"}`}
                >
                  <Sun className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition ${theme === "dark" ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/50 text-blue-600 dark:text-blue-400" : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"}`}
                >
                  <Moon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Contrast className="w-5 h-5 text-zinc-500" />
                  High Contrast Mode
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Enhances visibility of active elements.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.highContrast}
                  onChange={(e) =>
                    setSettings({ highContrast: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-zinc-200 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="w-full max-w-4xl mb-16">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Data Management
          </h2>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <button
              onClick={handleReset}
              className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-600/10 dark:hover:bg-red-600/20 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2"
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
    </div>
  );
}
