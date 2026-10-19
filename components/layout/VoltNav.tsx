"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VOLT_NAV, voltNavActive } from "@/lib/site/volt-nav";
import { cn } from "@/lib/utils";

export function VoltNav({
  className,
  onNavigate,
  stacked = false,
}: {
  className?: string;
  onNavigate?: () => void;
  stacked?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Volt Caddy"
      className={cn(
        stacked
          ? "flex flex-col gap-1"
          : "min-w-0 flex-1 items-center justify-center gap-x-4 overflow-x-auto xl:gap-x-6",
        className,
      )}
    >
      {VOLT_NAV.map((item) => {
        const active = voltNavActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "whitespace-nowrap text-sm font-medium transition-colors",
              stacked ? "rounded-md px-3 py-2.5 hover:bg-accent" : "py-2",
              active ? "text-primary" : "text-foreground hover:text-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
