import { BASE_DOMAIN } from "@repo/utils";
import Link from "next/link";

type AccessGridProps = {
  scopes: string[];
  role: string;
};

export function AccessGrid({ scopes, role }: AccessGridProps) {
  const hasScopes = scopes.length > 0;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-left">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">
            Your access
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {hasScopes
              ? "You are currently authorized for these applications."
              : role === "admin"
                ? "As an administrator, you can access every application."
                : "You do not currently have access to any applications."}
          </p>
        </div>
      </div>

      {hasScopes ? (
        <ul className="space-y-2.5">
          {scopes.map((scope) => (
            <li key={scope}>
              <Link
                href={`https://${scope}.${BASE_DOMAIN}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-800"
              >
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {scope}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Open app
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
