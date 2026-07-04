import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { AUTH_URL, ALL_SCOPES } from "@repo/utils";
import { auth } from "./server";

type AuthUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  isApproved: boolean;
  role: string;
  scopes: string[];
};

type AuthSession = {
  user: AuthUser;
  session: unknown;
};

export const getSession = cache(async (headers: Headers) => {
  try {
    const data = await auth.api.getSession({
      headers,
    });

    if (!data) return null;

    return data;
  } catch (error) {
    console.error("Error verifying session:", error);
    return null;
  }
});

export type AuthHelperOptions = {
  scope?: (typeof ALL_SCOPES)[number];
  /** If true, requires the admin role (in addition to approval). */
  admin?: boolean;
};

// for vite apps using vercel middleware
export async function validateAccessMiddleware(
  request: Request,
  options: AuthHelperOptions,
): Promise<Response> {
  if (!process.env.VERCEL) {
    return new Response(null, { headers: { "x-middleware-next": "1" } });
  }

  function redirectResponse(path?: string): Response {
    const headers = new Headers();
    headers.set("Location", `${AUTH_URL}${path}`);

    return new Response("Redirect", {
      status: 302,
      headers,
    });
  }

  try {
    const session = (await getSession(request.headers)) as AuthSession | null;

    if (!session) {
      return redirectResponse(`/?redirect=${options.scope}`);
    }

    const user = session.user;

    if (!user.isApproved) {
      return redirectResponse("/waiting");
    }

    if (user.role !== "admin") {
      if (
        options.admin ||
        (options.scope && !user.scopes.includes(options.scope))
      ) {
        return redirectResponse("/denied");
      }
    }

    return new Response(null, { headers: { "x-middleware-next": "1" } });
  } catch (error) {
    console.error("[validateAccessMiddleware] error:", error);
    return redirectResponse(`/?redirect=${options.scope}`);
  }
}

// for next.js apps using proxy.ts
export async function validateAccessProxy(
  request: Request,
  options: AuthHelperOptions,
): Promise<NextResponse> {
  if (!process.env.VERCEL) {
    return NextResponse.next();
  }

  try {
    const session = (await getSession(request.headers)) as AuthSession | null;

    if (!session) {
      return NextResponse.redirect(`${AUTH_URL}/?redirect=${options.scope}`);
    }

    const user = session.user;

    if (!user.isApproved) {
      return NextResponse.redirect(`${AUTH_URL}/waiting`);
    }

    if (user.role !== "admin") {
      if (
        options.admin ||
        (options.scope && !user.scopes.includes(options.scope))
      ) {
        return NextResponse.redirect(`${AUTH_URL}/denied`);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[validateAccessProxy] error:", error);
    return NextResponse.redirect(`${AUTH_URL}/?redirect=${options.scope}`);
  }
}

export async function validateAccess(
  options: AuthHelperOptions,
): Promise<void> {
  if (!process.env.VERCEL) return;

  try {
    const headersList = await headers();
    const session = (await getSession(headersList)) as AuthSession | null;

    if (!session) {
      return redirect(`${AUTH_URL}/?redirect=${options.scope}`);
    }

    const user = session.user;

    if (!user.isApproved) {
      return redirect(`${AUTH_URL}/waiting`);
    }

    if (user.role !== "admin") {
      if (
        options.admin ||
        (options.scope && !user.scopes.includes(options.scope))
      ) {
        return redirect(`${AUTH_URL}/denied`);
      }
    }
  } catch (error) {
    console.error("[validateAccess] error:", error);
    return redirect(`${AUTH_URL}/?redirect=${options.scope}`);
  }
}
