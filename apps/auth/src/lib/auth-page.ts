import { auth } from "@repo/auth";
import { BASE_DOMAIN } from "@repo/utils";
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

export function isSubdomainReferer(referer: string | null) {
  if (!referer) {
    return false;
  }

  try {
    const { hostname } = new URL(referer);
    const normalizedHost = hostname.toLowerCase();
    const normalizedBaseDomain = BASE_DOMAIN.toLowerCase();

    if (
      normalizedHost === normalizedBaseDomain ||
      normalizedHost === `auth.${normalizedBaseDomain}`
    ) {
      return false;
    }

    return normalizedHost.endsWith(`.${normalizedBaseDomain}`);
  } catch {
    return false;
  }
}

export async function getDeniedPageUser() {
  const user = await getAuthenticatedUser();

  if (!user.isApproved) {
    redirect("/waiting");
  }

  const referer = (await headers()).get("referer");

  if (!isSubdomainReferer(referer)) {
    redirect("/account");
  }

  return user;
}
