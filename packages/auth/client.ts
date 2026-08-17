import type { BetterAuthClientOptions } from "better-auth";
import { AUTH_URL } from "@repo/utils";
import { createAuthClient, type ReactAuthClient } from "better-auth/react";
import {
  customSessionClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "./server";

export const authClient: ReactAuthClient<BetterAuthClientOptions> =
  createAuthClient({
    baseURL: AUTH_URL,
    plugins: [
      customSessionClient<typeof auth>(),
      inferAdditionalFields<typeof auth>(),
    ],
  });

export const useAuth = () => {
  if (process.env.NODE_ENV !== "production") return { isAdmin: true };

  const { data } = authClient.useSession();
  const user = data?.user as { role?: string } | undefined;

  return { isAdmin: user?.role === "admin" };
};
