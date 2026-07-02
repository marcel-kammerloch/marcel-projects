"use client";

import { authClient } from "@repo/auth/client";
import { useState } from "react";
import { ALL_SCOPES, BASE_DOMAIN, SCOPES } from "@repo/utils";
import { Alert } from "@/components/alert";
import { useAlert } from "@/components/use-alert";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { state: alertState, showError, close } = useAlert();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      let callbackURL;
      const params = new URLSearchParams(window.location.search);
      const redirectScope = params.get("redirect");

      if (
        redirectScope &&
        ALL_SCOPES.some((scope) => scope === redirectScope) &&
        SCOPES.hasOwnProperty(redirectScope)
      ) {
        callbackURL = `https://${redirectScope}.${BASE_DOMAIN}`;
      }

      const { error } = await authClient.signIn.social({
        provider: "google",
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
      setIsLoading(false);
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

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="cursor-pointer w-full py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>
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
