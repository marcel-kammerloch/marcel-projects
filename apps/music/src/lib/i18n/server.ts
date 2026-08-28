import { cookies, headers } from "next/headers";
import type { Locale, Dictionary } from "./types";
import { en } from "./dictionaries/en";
import { de } from "./dictionaries/de";

export const dictionaries: Record<Locale, Dictionary> = {
  en,
  de,
};

export function parseAcceptLanguage(header: string | null): Locale {
  if (!header) return "en";

  // Parse comma-separated language tags with quality values, e.g. "de-DE,de;q=0.9,en;q=0.8"
  const languages = header.split(",").map((part) => {
    const [lang, qVal] = part.trim().split(";");
    const q = qVal && qVal.startsWith("q=") ? parseFloat(qVal.slice(2)) : 1.0;
    return { lang: lang.toLowerCase().trim(), q: isNaN(q) ? 1.0 : q };
  });

  // Sort by priority (q value) descending
  languages.sort((a, b) => b.q - a.q);

  for (const { lang } of languages) {
    if (lang === "de" || lang.startsWith("de-")) {
      return "de";
    }
    if (lang === "en" || lang.startsWith("en-")) {
      return "en";
    }
  }

  return "en";
}

export async function getLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const explicitLocale = cookieStore.get("NEXT_LOCALE")?.value;

    if (explicitLocale === "de" || explicitLocale === "en") {
      return explicitLocale;
    }

    const headerStore = await headers();
    const acceptLanguage = headerStore.get("accept-language");
    return parseAcceptLanguage(acceptLanguage);
  } catch {
    // If called outside of a request context or during static optimization
    return "en";
  }
}

export async function getTranslations(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale];
}
