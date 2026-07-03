import { betterAuth } from "better-auth/minimal";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";
import { AUTH_URL, BASE_DOMAIN } from "@repo/utils";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: BASE_DOMAIN,
    },
    cookiePrefix: "auth",
  },
  baseURL: AUTH_URL,
  database: drizzleAdapter(prisma, {
    provider: "pg",
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
  plugins: [admin(), nextCookies()],
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
});
