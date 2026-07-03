import { betterAuth, BetterAuthOptions } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { db } from "./drizzle";
import { AUTH_URL, BASE_DOMAIN } from "@repo/utils";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./schema";
import { customSession } from "better-auth/plugins";

export const config = {
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: BASE_DOMAIN,
    },
    cookiePrefix: "auth",
  },
  baseURL: AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
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
  plugins: [nextCookies()],
  secret: process.env.MARCEL_PROJECTS_AUTH_SECRET,
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
  socialProviders: {
    google: {
      clientId: process.env.MARCEL_PROJECTS_GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.MARCEL_PROJECTS_GOOGLE_CLIENT_SECRET ?? "",
      accessType: "offline",
    },
  },
  trustedOrigins: [`https://*.${BASE_DOMAIN}`],
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
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth(config) as ReturnType<
  typeof betterAuth<typeof config>
>;
