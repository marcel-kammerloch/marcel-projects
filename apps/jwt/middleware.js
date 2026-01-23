import { validateAuth } from "@repo/auth-middleware";

export default async function middleware(request) {
  return await validateAuth(request, "jwt");
}

export const config = {
  matcher: [
    // Skip images and all static files, unless found in search params
    "/((?!images|[^?]*\\.(?:png|svg|ico|webmanifest)).*)",
  ],
};
