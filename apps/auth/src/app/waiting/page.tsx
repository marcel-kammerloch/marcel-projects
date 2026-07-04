import { AuthStatusCard } from "@/components/auth-status-card";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthenticatedUser } from "@/lib/auth-page";
import { redirect } from "next/navigation";

export default async function WaitingPage() {
  const user = await getAuthenticatedUser();

  if (user.isApproved) {
    redirect("/account");
  }

  return (
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
