"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALE_LIST, type Locale } from "@/lib/i18n/locale";
import { useLocaleStore } from "@/lib/store/locale";
import { useDictionary } from "@/lib/i18n/I18nProvider";

type Props = {
  className?: string;
};

export function LanguageSelector({ className }: Props) {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const [pending, setPending] = useState(false);
  const dict = useDictionary();

  async function onValueChange(next: string | null) {
    if (!next || next === locale || pending) return;

    setPending(true);
    try {
      const res = await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      if (!res.ok) return;
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Select value={locale} onValueChange={onValueChange} disabled={pending}>
      <SelectTrigger size="sm" aria-label={dict.nav.language} className={className}>
        <Languages className="size-4 shrink-0 text-muted-foreground sm:hidden" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[11rem]">
        {LOCALE_LIST.map((entry) => (
          <SelectItem
            key={entry.code}
            value={entry.code as Locale}
            className="pr-2 [&_[data-slot=select-item-indicator]]:hidden"
          >
            {entry.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
