import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });

  if (!session) {
    redirect("/");
  }

  return session.user;
}
