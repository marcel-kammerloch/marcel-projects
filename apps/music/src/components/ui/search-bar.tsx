"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const { t } = useTranslation();

  const effectivePlaceholder = placeholder || t.library.searchPlaceholder;

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className={`relative ${className || ""}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={effectivePlaceholder}
        className="pl-9 bg-zinc-800/50 border-transparent focus-visible:ring-blue-500 rounded-xl"
      />
    </div>
  );
}
