import { AccessGrid } from "@/components/access-grid";
import { AuthStatusCard } from "@/components/auth-status-card";
import { SignOutButton } from "@/components/sign-out-button";
import { getDeniedPageUser } from "@/lib/auth-page";

export default async function DeniedPage() {
  const user = await getDeniedPageUser();

  return (
    <AuthStatusCard
      title="Access denied"
      description="You do not have permission to open this application yet. An administrator needs to grant you access."
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
            d="M12 3l7 4v5c0 4.2-2.8 7.9-7 9-4.2-1.1-7-4.8-7-9V7l7-4z"
          />
        </svg>
      }
      accentClassName="bg-red-500/15 text-red-400"
      footer={<SignOutButton />}
    >
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-left text-sm text-zinc-400">
        <p>
          The application redirected you here because your account is missing
          access to that app.
        </p>
      </div>

      <AccessGrid scopes={user.scopes} role={user.role} />
    </AuthStatusCard>
  );
}
