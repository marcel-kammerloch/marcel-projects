import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { db } from "./drizzle";
import { AUTH_URL, BASE_DOMAIN } from "@repo/utils";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./schema";
import { customSession } from "better-auth/plugins";

export const auth = betterAuth({
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
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
          isApproved: ("isApproved" in user
            ? user.isApproved
            : false) as boolean,
          scopes: ("scopes" in user ? user.scopes : []) as string[],
          role: ("role" in user ? user.role : "user") as string,
        },
        session,
      };
    }),
    nextCookies(),
  ],
  secret: process.env.MARCEL_PROJECTS_AUTH_SECRET,
  session: {
    freshAge: 0, // disabled
    expiresIn: 60 * 60 * 24 * 60, // 60 days
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
    github: {
      clientId: process.env.MARCEL_PROJECTS_GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.MARCEL_PROJECTS_GITHUB_CLIENT_SECRET ?? "",
    },
  },
  trustedOrigins: [`https://*.${BASE_DOMAIN}`],
  user: {
    additionalFields: {
      isApproved: {
        type: "boolean",
        defaultValue: false,
        input: false,
        returned: true,
      },
      scopes: {
        type: "string[]",
        defaultValue: [],
        input: false,
        returned: true,
      },
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
        returned: true,
      },
    },
  },
});
