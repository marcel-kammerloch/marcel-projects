import { validateAccessProxy } from "@repo/auth";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await validateAccessProxy(request, { scope: "music" });
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|well-known|[^?]*\\.(?:css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|webmanifest|txt)).*)",
  ],
};
