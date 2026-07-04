import { AUTH_URL } from "@repo/utils";
import { createAuthClient } from "better-auth/react";
import {
  customSessionClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "./server";

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  plugins: [
    customSessionClient<typeof auth>(),
    inferAdditionalFields<typeof auth>(),
  ],
});

export const useAuth = () => {
  const { data } = authClient.useSession();

  return { isAdmin: data?.user.role === "admin" };
};
