"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Globe } from "lucide-react";
import Link from "next/link";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation, LanguageSetting } from "@/lib/i18n";
import { useSettingsStore } from "@/store/useSettingsStore";

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
    <div
      className={`pt-6 border-zinc-800 flex items-center justify-between ${border ? "border-t" : ""}`}
    >
      <div>
        <h3 className="text-base font-medium text-zinc-100 block">{title}</h3>
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
  const { settings, setSettings } = useSettingsStore();
  const { t, languageSetting, setLanguage } = useTranslation();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const playbackSettings = [
    {
      title: t.settings.keepScreenOnTitle,
      description: t.settings.keepScreenOnDesc,
      checked: settings.keepScreenOn,
      onChange: (checked: boolean) => setSettings({ keepScreenOn: checked }),
    },
    {
      title: t.settings.saveBatteryTitle,
      description: t.settings.saveBatteryDesc,
      checked: settings.saveBattery,
      onChange: (checked: boolean) => setSettings({ saveBattery: checked }),
    },
    {
      title: t.settings.reduceDynamicRangeTitle,
      description: t.settings.reduceDynamicRangeDesc,
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
      toast.error(t.settings.resetFailed(String(error)));
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-4">
      <div className="flex items-center gap-4 py-6">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-800/50">
          <ArrowLeft className="w-6 h-6 text-zinc-100" />
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">{t.settings.title}</h1>
      </div>

      <div className="gap-8 my-4 flex items-center flex-col">
        {/* Playback Section */}
        <section className="w-full max-w-4xl">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            {t.settings.playback}
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-6">
            <label
              className="text-base font-medium text-zinc-100 block mb-4"
              htmlFor="duration-btns"
            >
              {t.settings.fastForwardDuration}
            </label>
            <div
              className="flex gap-2 bg-zinc-950 p-1.5 rounded-xl"
              id="duration-btns"
            >
              {[10, 15, 30].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSettings({ skipDuration: val })}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-semibold text-sm transition cursor-pointer",
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
                key={String(setting.title)}
                title={setting.title}
                description={setting.description}
                checked={setting.checked}
                onChange={setting.onChange}
                border
              />
            ))}
          </div>
        </section>

        {/* Language Section */}
        <section className="w-full max-w-4xl">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            {t.settings.language}
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-zinc-200">
              <Globe className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="text-base font-medium text-zinc-100">
                  {t.settings.language}
                </h3>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {t.settings.languageDesc}
                </p>
              </div>
            </div>
            <div className="flex gap-2 bg-zinc-950 p-1.5 rounded-xl mt-3">
              {(
                [
                  { key: "auto", label: t.settings.languageOptions.auto },
                  { key: "en", label: t.settings.languageOptions.en },
                  { key: "de", label: t.settings.languageOptions.de },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setLanguage(opt.key as LanguageSetting)}
                  className={cn(
                    "flex-1 py-3 rounded-lg font-semibold text-sm transition cursor-pointer",
                    languageSetting === opt.key
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="w-full max-w-4xl">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            {t.settings.appearance}
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 pb-5 space-y-6 shadow-sm">
            <ToggleSetting
              title={t.settings.highContrastTitle}
              description={t.settings.highContrastDesc}
              checked={settings.highContrast}
              onChange={(checked) => setSettings({ highContrast: checked })}
            />
            <ToggleSetting
              title={t.settings.reduceAnimationsTitle}
              description={t.settings.reduceAnimationsDesc}
              border
              checked={settings.reduceAnimations}
              onChange={(checked) => setSettings({ reduceAnimations: checked })}
            />
          </div>
        </section>

        {/* Data Management Section */}
        <section className="w-full max-w-4xl md:mb-8">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            {t.settings.dataManagement}
          </h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm">
            <button
              onClick={handleReset}
              className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-5 h-5" />
              {t.settings.resetApp}
            </button>
            <p className="text-xs text-center text-zinc-500 mt-4">
              {t.settings.resetAppDesc}
            </p>
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title={t.settings.resetModalTitle}
        description={t.settings.resetModalDesc}
        onConfirm={confirmReset}
        confirmText={t.settings.resetModalConfirm}
        cancelText={t.common.cancel}
        isDestructive={true}
      />
    </div>
  );
}
