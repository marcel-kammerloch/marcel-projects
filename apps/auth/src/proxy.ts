import { NextRequest, NextResponse } from "next/server";
import { BASE_DOMAIN } from "@repo/utils";

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;

  try {
    const { protocol, hostname } = new URL(origin);

    return (
      protocol === "https:" &&
      (hostname === BASE_DOMAIN || hostname.endsWith(`.${BASE_DOMAIN}`))
    );
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });

    if (isAllowedOrigin(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin!);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        request.headers.get("access-control-request-headers") ??
          "Content-Type, Authorization",
      );
      response.headers.set("Vary", "Origin");
    }

    return response;
  }

  const response = NextResponse.next();

  if (isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }

  return response;
}
