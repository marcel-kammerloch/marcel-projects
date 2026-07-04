import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DeniedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });

  if (!session) {
    redirect("/");
  }

  const user = session.user;

  if (!user.isApproved) {
    redirect("/waiting");
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-950 text-white p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center shadow-xl">
        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          You are currently signed in as {user.name} ({user.email})
        </p>

        {user.scopes.length > 0 ? (
          <div className="text-left bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
              You currently have access to:
            </h2>
            <ul className="space-y-2">
              {user.scopes.map((scope) => (
                <li key={scope} className="flex items-center text-zinc-400">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                  {scope}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-left bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <p className="text-zinc-500 text-sm italic">
              {user.role === "admin"
                ? "You currently have access to all applications because you are an admin"
                : "You currently do not have access to any applications."}
            </p>
          </div>
        )}

        <SignOutButton />
      </div>
    </div>
  );
}
