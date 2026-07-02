import { validateAccessMiddleware } from "@repo/auth";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await validateAccessMiddleware(request, { scope: "music-pwa" });
}

export const config = {
  matcher: [
    // Skip images, audios and all static files, unless found in search params
    "/((?!images|audios|_next|[^?]*\\.(?:png|svg|ico|webmanifest|mp3)).*)",
  ],
};
