import { AUTH_URL } from "@repo/utils";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
});

export const useAuth = () => {
  const { data } = authClient.useSession();

  const role =
    data && data.user && "role" in data.user ? data.user.role : "user";

  return { isAdmin: role === "admin" };
};
