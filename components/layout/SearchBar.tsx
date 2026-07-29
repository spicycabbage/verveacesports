"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function SearchBar({ className }: { className?: string }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const dict = useDictionary();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form onSubmit={submit} className={`relative ${className ?? ""}`}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={dict.nav.searchPlaceholder}
        className="h-11 pl-10 text-base"
        type="search"
      />
    </form>
  );
}
