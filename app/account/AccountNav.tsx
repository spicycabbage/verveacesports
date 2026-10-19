"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headset } from "lucide-react";
import { useChatStore } from "@/lib/store/chat";
import { cn } from "@/lib/utils";

const itemClass =
  "min-w-0 flex-1 rounded-md px-1 py-2 text-center text-xs font-medium hover:bg-accent sm:text-sm md:flex-none md:px-3 md:text-left md:text-sm";

export function AccountNav({
  items,
  liveAgentLabel,
}: {
  items: readonly { href: string; label: string }[];
  liveAgentLabel: string;
}) {
  const pathname = usePathname();
  const openLiveAgent = useChatStore((s) => s.openLiveAgent);

  return (
    <nav className="flex w-full items-stretch gap-0.5 md:flex-col md:gap-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            itemClass,
            (item.href === "/account" ? pathname === "/account" : pathname.startsWith(item.href)) &&
              "bg-accent",
          )}
        >
          {item.label}
        </Link>
      ))}
      <button
        type="button"
        className={cn(itemClass, "inline-flex items-center justify-center gap-1.5 md:justify-start")}
        onClick={() => openLiveAgent()}
      >
        <Headset className="hidden size-3.5 md:inline" />
        {liveAgentLabel}
      </button>
    </nav>
  );
}
