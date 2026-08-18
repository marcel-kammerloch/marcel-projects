import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ActionIconButtonVariant = "neutral" | "primary" | "danger";

interface ActionIconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: ActionIconButtonVariant;
  className?: string;
}

const variantClasses: Record<ActionIconButtonVariant, string> = {
  neutral:
    "p-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-800/50 cursor-pointer",
  primary:
    "p-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 rounded-xl transition flex items-center justify-center border border-blue-500/20 cursor-pointer",
  danger:
    "p-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl transition flex items-center justify-center border border-red-500/20 cursor-pointer",
};

export default function ActionIconButton({
  icon: Icon,
  label,
  onClick,
  variant = "neutral",
  className,
}: ActionIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(variantClasses[variant], className)}
    >
      <Icon className="w-5 h-5 pointer-events-none" />
    </button>
  );
}
