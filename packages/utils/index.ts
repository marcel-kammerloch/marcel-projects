export const BASE_DOMAIN = "marcel-projects.vercel.app";
export const AUTH_URL = "https://auth.marcel-projects.vercel.app";

export const SCOPES = {
  JWT: "jwt",
  MEMORY_PI_GAME: "memory-pi-game",
  MUSIC_PWA: "music-pwa",
} as const;

export const ALL_SCOPES = Object.values(SCOPES);
