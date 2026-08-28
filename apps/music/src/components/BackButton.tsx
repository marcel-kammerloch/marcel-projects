"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ActionIconButton from "@/components/ui/ActionIconButton";
import { useTranslation } from "@/lib/i18n";

export default function BackButton() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="mb-4 w-fit">
      <ActionIconButton
        icon={ArrowLeft}
        label={t.common.back}
        onClick={() => router.back()}
        variant="neutral"
        className="-ml-2 flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-zinc-400 hover:text-white"
      />
    </div>
  );
}
