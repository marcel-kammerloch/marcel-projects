import { AUTH_URL } from "@repo/utils";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  plugins: [adminClient()],
});

export const useAuth = () => {
  const { data } = authClient.useSession();

  return { isAdmin: data?.user?.role === "admin" };
};
