import { validateAuth } from "@repo/auth-middleware";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await validateAuth(request, "music-player");
}

export const config = {
  matcher: [
    // Skip images, audios and all static files, unless found in search params
    "/((?!images|audios|_next|[^?]*\\.(?:png|svg|ico|webmanifest|mp3)).*)",
  ],
};
