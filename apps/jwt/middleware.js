import { validateAccessMiddleware } from "@repo/auth";

export default async function middleware(request) {
  return await validateAccessMiddleware(request, { scope: "jwt" });
}

export const config = {
  matcher: [
    // Skip images and all static files, unless found in search params
    "/((?!images|[^?]*\\.(?:png|svg|ico|webmanifest)).*)",
  ],
};
