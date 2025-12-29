import { jwtVerify } from "jose";
import { parseCookie } from "cookie";

const JWT_SECRET = new TextEncoder().encode(
  process.env.MARCEL_PROJECTS_AUTH_TOKEN_SECRET
);

export async function validateAuth(
  request: Request,
  scope: string
): Promise<Response> {
  const authUrl = "https://auth.marcel-projects.vercel.app";
  const cookieName = "auth-token";
  const domain = ".marcel-projects.vercel.app";

  const authRedirectUrl = new URL(authUrl);
  authRedirectUrl.searchParams.set(
    "redirect",
    `https://${scope}.marcel-projects.vercel.app`
  );

  function redirectResponse({
    deleteAuthCookie = false,
    notEnoughScopesError,
  }: {
    deleteAuthCookie?: boolean;
    notEnoughScopesError?: boolean;
  } = {}): Response {
    if (notEnoughScopesError) {
      authRedirectUrl.searchParams.set("error", "not_enough_scopes");
    }

    const headers = new Headers();
    headers.set("Location", authRedirectUrl.toString());

    if (deleteAuthCookie) {
      headers.set(
        "Set-Cookie",
        `${cookieName}=deleted; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
      );
    }

    return new Response("Redirect", {
      status: 302,
      headers,
    });
  }

  const cookieHeader = request.headers.get("cookie");
  const cookies = parseCookie(cookieHeader || "");
  const authToken = cookies[cookieName];

  if (!authToken) return redirectResponse();

  try {
    const { payload } = await jwtVerify(authToken, JWT_SECRET, {
      issuer: authUrl,
    });

    if (payload.isAuthenticated !== true)
      return redirectResponse({ deleteAuthCookie: true });

    if (payload.scope !== scope && payload.scope !== "*") {
      return redirectResponse({ notEnoughScopesError: true });
    }

    const headers = new Headers();
    headers.set("x-middleware-next", "1");

    return new Response(null, { headers });
    // return null;
  } catch (error) {
    console.error("error verifying jwt", error);
    return redirectResponse({ deleteAuthCookie: true });
  }
}
