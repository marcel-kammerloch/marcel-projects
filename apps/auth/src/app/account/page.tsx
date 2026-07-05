import { AccessGrid } from "@/components/access-grid";
import { AuthStatusCard } from "@/components/auth-status-card";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthenticatedUser } from "@/lib/auth-page";

export default async function AccountPage() {
  const user = await getAuthenticatedUser();

  return user.isApproved ? (
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
          Approved
        </span>
        <span className="rounded-full border border-zinc-700 bg-zinc-950/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
          {user.role}
        </span>
      </div>

      <AccessGrid scopes={user.scopes} role={user.role} />
    </AuthStatusCard>
  ) : (
    <AuthStatusCard
      title="Waiting for approval"
      description="Your account is ready, but it still needs an administrator to approve it before you can access any applications."
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      accentClassName="bg-amber-500/15 text-amber-400"
      footer={<SignOutButton />}
    >
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-left text-sm text-zinc-400">
        <p>
          Once your access has been approved, you will be redirected to your
          account overview automatically.
        </p>
      </div>
    </AuthStatusCard>
  );
}
