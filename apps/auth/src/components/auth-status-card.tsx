import type { ReactNode } from "react";

type AuthStatusCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  accentClassName: string;
  children?: ReactNode;
  footer?: ReactNode;
};

export function AuthStatusCard({
  title,
  description,
  icon,
  accentClassName,
  children,
  footer,
}: AuthStatusCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-8 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/95 p-8 shadow-2xl shadow-black/30">
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${accentClassName}`}
        >
          {icon}
        </div>

        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm leading-6 text-zinc-400">{description}</p>
        </div>

        {children ? <div className="mt-8 space-y-4">{children}</div> : null}

        {footer ? (
          <div className="mt-8 flex justify-center">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
