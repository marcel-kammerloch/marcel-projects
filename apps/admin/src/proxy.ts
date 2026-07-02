import { NextRequest } from "next/server";
import { validateAccessMiddleware } from "@repo/auth";

export async function proxy(request: NextRequest) {
  return await validateAccessMiddleware(request, { admin: true });
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next|[^?]*\\.(?:png|svg|ico|webmanifest|mp3)).*)",
  ],
};
