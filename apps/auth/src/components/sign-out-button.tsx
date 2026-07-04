"use client";

import { authClient } from "@repo/auth/client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
      }}
      className="text-zinc-500 hover:text-white transition-colors text-sm font-medium"
    >
      Sign out and try another account
    </button>
  );
}
