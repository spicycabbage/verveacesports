"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const FILTERS = [
  { id: null, label: "All users" },
  { id: "buyers", label: "Verified Buyers" },
  { id: "leads", label: "Draw / Newsletter" },
] as const;

export function UsersToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const filter = sp.get("filter") ?? "";

  function setFilter(next: string | null) {
    const params = new URLSearchParams(sp.toString());
    if (next) params.set("filter", next);
    else params.delete("filter");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((item) => {
        const active = item.id === null ? !filter : filter === item.id;
        return (
          <Button
            key={item.label}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}
