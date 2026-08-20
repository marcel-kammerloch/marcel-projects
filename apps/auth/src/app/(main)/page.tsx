"use client";

import { authClient } from "@repo/auth/client";
import { useEffect, useState } from "react";
import { ALL_SCOPES, AUTH_URL, BASE_DOMAIN } from "@repo/utils";
import { Alert } from "@/components/alert/alert";
import { useAlert } from "@/components/alert/use-alert";
import { PROVIDERS } from "./providers";

const RECENT_ATTEMPT_TTL_MS = 10 * 60 * 1000;
const RECENT_ATTEMPT_STORAGE_KEY = "auth:last-sign-in-attempt";

export default function AuthPage() {
  const [loadingProviderId, setLoadingProviderId] = useState<string | null>(
    null,
  );
  const { state: alertState, showError, close } = useAlert();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const storedAttemptAt = window.localStorage.getItem(
      RECENT_ATTEMPT_STORAGE_KEY,
    );

    if (!error || !storedAttemptAt) {
      return;
    }

    const timestamp = Number(storedAttemptAt);
    const ageMs = Date.now() - timestamp;

    if (!Number.isFinite(timestamp) || ageMs > RECENT_ATTEMPT_TTL_MS) {
      window.localStorage.removeItem(RECENT_ATTEMPT_STORAGE_KEY);
      return;
    }

    const normalizedError = decodeURIComponent(error).trim();
    const message =
      normalizedError
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") || "An unexpected authentication error occurred.";

    showError("Authentication Failed", message);
    window.localStorage.removeItem(RECENT_ATTEMPT_STORAGE_KEY);
  }, [showError]);

  const handleSignIn = async (provider: (typeof PROVIDERS)[number]["id"]) => {
    setLoadingProviderId(provider);
    window.localStorage.setItem(
      RECENT_ATTEMPT_STORAGE_KEY,
      Date.now().toString(),
    );

    try {
      let callbackURL = `${AUTH_URL}/account`;

      const params = new URLSearchParams(window.location.search);
      const redirectScope = params.get("redirect")?.toLowerCase();

      if (redirectScope && ALL_SCOPES.includes(redirectScope as never)) {
        callbackURL = `https://${redirectScope}.${BASE_DOMAIN}`;
      }

      const { error } = await authClient.signIn.social({
        provider,
        callbackURL,
      });

      if (error) {
        showError("Authentication Failed", error.message);
      }
    } catch (error) {
      console.error(error);
      showError(
        "Authentication Failed",
        "An error occurred during authentication",
      );
    } finally {
      setLoadingProviderId(null);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white selection:bg-zinc-800">
        <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Welcome
          </h1>

          <p className="text-zinc-400 mb-8 text-center text-sm">
            Sign in to access your apps.
          </p>

          <div className="w-full flex flex-col gap-3">
            {PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleSignIn(provider.id)}
                disabled={!!loadingProviderId}
                className="cursor-pointer select-none w-full py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-medium transition-all transform hover:scale-[1.015] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
              >
                {loadingProviderId === provider.id ? (
                  <span className="size-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  provider.icon
                )}

                <span>Continue with {provider.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Alert
        isVisible={alertState.isVisible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={close}
      />
    </>
  );
}
