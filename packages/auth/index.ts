import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { AUTH_URL, ALL_SCOPES, BASE_DOMAIN } from "@repo/utils";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";

export const auth = betterAuth({
  baseURL: AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: BASE_DOMAIN,
    },
    cookiePrefix: "auth",
  },
  secret: process.env.MARCEL_PROJECTS_AUTH_SECRET,
  plugins: [admin(), nextCookies()],
  socialProviders: {
    google: {
      clientId: process.env.MARCEL_PROJECTS_GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.MARCEL_PROJECTS_GOOGLE_CLIENT_SECRET ?? "",
      accessType: "offline",
    },
  },
  user: {
    additionalFields: {
      isApproved: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      scopes: {
        type: "string[]",
        defaultValue: [],
        input: false,
      },
    },
  },
  session: {
    freshAge: 0, // disabled
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24 * 7, // 7 days
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true, // Enable caching session in cookie
      maxAge: 30 * 60, // 30 minutes
      strategy: "jwt",
    },
  },
  // databaseHooks: {
  //   session: {
  //     create: {
  //       before: async (session) => {
  //         try {
  //           const user = await prisma.user.findUnique({
  //             where: { id: session.userId },
  //             select: { isApproved: true },
  //           });
  //           if (!user?.isApproved) {
  //             return false;
  //           }
  //         } catch (error) {
  //           console.error(
  //             "[auth.databaseHooks.session.create.before] error:",
  //             error,
  //           );
  //           return false;
  //         }
  //       },
  //     },
  //   },
  // },
});

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

export async function validateAccessMiddleware(
  request: Request,
  options: AuthHelperOptions,
): Promise<NextResponse> {
  if (!process.env.VERCEL) {
    return NextResponse.next();
  }

  try {
    const session = await getSession(request.headers);

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
    console.error("[validateAccessMiddleware] error:", error);
    return NextResponse.redirect(`${AUTH_URL}/?redirect=${options.scope}`);
  }
}

export async function validateAccess(
  options: AuthHelperOptions,
): Promise<void> {
  if (!process.env.VERCEL) return;

  try {
    const headersList = await headers();
    const session = await getSession(headersList);

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
