"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyDocumentLocale, isLocale, LOCALE_LIST, type Locale } from "@/lib/i18n/locale";
import { blogPathForLocale } from "@/lib/content/blog/paths";
import { persistLocale } from "@/lib/i18n/persist-locale";
import { useLocaleStore } from "@/lib/store/locale";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function LanguageSelector({ className }: Props) {
  const pathname = usePathname();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const [pending, setPending] = useState(false);
  const dict = useDictionary();

  async function onValueChange(next: string | null) {
    if (!next || !isLocale(next) || next === locale || pending) return;

    setPending(true);
    setLocale(next);
    applyDocumentLocale(next);
    try {
      const ok = await persistLocale(next);
      if (!ok) {
        setLocale(locale);
        return;
      }
      // Full load. router.push/refresh keeps other routes cached in English
      // from before this cookie existed.
      const nextPath = blogPathForLocale(pathname, next);
      const dest =
        nextPath && nextPath !== pathname
          ? nextPath
          : `${window.location.pathname}${window.location.search}`;
      window.location.assign(dest);
    } finally {
      setPending(false);
    }
  }

  return (
    <Select value={locale} onValueChange={onValueChange} disabled={pending}>
      <SelectTrigger
        size="sm"
        aria-label={dict.nav.language}
        translate="no"
        className={cn("notranslate", className)}
      >
        <Languages className="size-4 shrink-0 text-muted-foreground sm:hidden" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align="end"
        alignItemWithTrigger={false}
        className="notranslate min-w-[11rem] max-h-none overflow-y-visible"
        translate="no"
      >
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
