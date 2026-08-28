"use client";

import { useState } from "react";
import UploadModal from "./UploadModal";
import { Plus } from "lucide-react";
import AdminOnly from "../AdminOnly";
import { useTranslation } from "@/lib/i18n";

export default function UploadModalBtn() {
  return (
    <AdminOnly>
      <UploadModalButton />
    </AdminOnly>
  );
}

function UploadModalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-zinc-800 hover:bg-zinc-700 text-blue-400 p-2 rounded-full transition shadow text-sm flex items-center gap-2 pr-4 font-medium cursor-pointer"
      >
        <div className="bg-blue-600 rounded-full p-1 text-white">
          <Plus className="w-4 h-4" />
        </div>
        {t.library.addMusic}
      </button>

      <UploadModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
