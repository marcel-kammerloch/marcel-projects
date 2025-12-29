export function validateRedirectUrl(redirectParam: string | null): string {
  const defaultUrl = "https://marcel-projects.vercel.app";

  if (!redirectParam) {
    return defaultUrl;
  }

  try {
    const url = new URL(
      redirectParam.startsWith("https://")
        ? redirectParam
        : `https://${redirectParam}`
    );

    // Check if hostname matches *.marcel-projects.vercel.app pattern
    const hostname = url.hostname;
    const validPattern = /^([a-zA-Z0-9-]+\.)?marcel-projects\.vercel\.app$/;

    if (validPattern.test(hostname)) {
      return `${url.protocol}//${url.hostname}`;
    } else {
      return defaultUrl;
    }
  } catch {
    // Invalid URL format
    return defaultUrl;
  }
}
