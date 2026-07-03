import { redirect } from "next/navigation";
import { SignOutButton } from "./page-client";
import { headers } from "next/headers";
import { auth } from "@repo/auth";

export default async function WaitingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const user = session.user;

  if (user.isApproved) {
    redirect("/denied");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center shadow-xl">
        <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Waiting for Approval</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Your account has been created successfully, but it must be approved by
          an administrator before you can access any applications.
        </p>
        <SignOutButton />
      </div>
    </div>
  );
}
