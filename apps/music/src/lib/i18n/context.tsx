"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import type { Locale, Dictionary } from "./types";
import { en } from "./dictionaries/en";
import { de } from "./dictionaries/de";
import { useRouter } from "next/navigation";

const dictionaries: Record<Locale, Dictionary> = {
  en,
  de,
};

export type LanguageSetting = "auto" | "en" | "de";

interface I18nContextType {
  locale: Locale;
  languageSetting: LanguageSetting;
  t: Dictionary;
  setLanguage: (setting: LanguageSetting) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLocaleState(): { setting: LanguageSetting; locale: Locale } {
  if (typeof document === "undefined") {
    return { setting: "auto", locale: "en" };
  }

  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);
  const cookieVal = match ? decodeURIComponent(match[1]) : null;

  if (cookieVal === "en" || cookieVal === "de") {
    return { setting: cookieVal, locale: cookieVal };
  }

  // Auto / System preference from browser
  const navLang =
    typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "en";
  const detected: Locale = navLang.startsWith("de") ? "de" : "en";
  return { setting: "auto", locale: detected };
}

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale?: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [{ setting: languageSetting, locale }, setState] = useState(() => {
    if (initialLocale) {
      return { setting: initialLocale as LanguageSetting, locale: initialLocale };
    }
    return getInitialLocaleState();
  });

  const setLanguage = useCallback(
    (newSetting: LanguageSetting) => {
      let resolvedLocale: Locale = "en";
      if (newSetting === "auto") {
        document.cookie = "NEXT_LOCALE=; path=/; max-age=0; SameSite=Lax";
        const navLang =
          typeof navigator !== "undefined"
            ? navigator.language.toLowerCase()
            : "en";
        resolvedLocale = navLang.startsWith("de") ? "de" : "en";
      } else {
        document.cookie = `NEXT_LOCALE=${newSetting}; path=/; max-age=31536000; SameSite=Lax`;
        resolvedLocale = newSetting;
      }

      setState({ setting: newSetting, locale: resolvedLocale });
      router.refresh();
    },
    [router],
  );

  const value = useMemo(
    () => ({
      locale,
      languageSetting,
      t: dictionaries[locale] || dictionaries.en,
      setLanguage,
    }),
    [locale, languageSetting, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: "en",
      languageSetting: "auto",
      t: dictionaries.en,
      setLanguage: () => {},
    };
  }
  return context;
}
