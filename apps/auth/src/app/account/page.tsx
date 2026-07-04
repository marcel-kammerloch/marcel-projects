import { AccessGrid } from "@/components/access-grid";
import { AuthStatusCard } from "@/components/auth-status-card";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthenticatedUser } from "@/lib/auth-page";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const user = await getAuthenticatedUser();

  if (!user.isApproved) {
    redirect("/waiting");
  }

  return (
    <AuthStatusCard
      title="Account"
      description={`You are signed in as ${user.name} (${user.email})`}
      icon={
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      }
      accentClassName="bg-emerald-500/15 text-emerald-400"
      footer={<SignOutButton />}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
          {user.isApproved ? "Approved" : "Pending approval"}
        </span>
        <span className="rounded-full border border-zinc-700 bg-zinc-950/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          {user.role}
        </span>
      </div>

      <AccessGrid scopes={user.scopes} role={user.role} />
    </AuthStatusCard>
  );
}
