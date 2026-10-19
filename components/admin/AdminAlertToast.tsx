"use client";

import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

export function showAdminAlertToast(opts: {
  title: string;
  body: string;
  href: string;
  icon: LucideIcon;
  duration?: number;
}): void {
  const Icon = opts.icon;
  toast.custom(
    (id) => (
      <button
        type="button"
        onClick={() => {
          toast.dismiss(id);
          window.location.assign(opts.href);
        }}
        className="flex w-[min(92vw,22rem)] items-start gap-3 rounded-xl border border-white/10 bg-zinc-950/95 px-3.5 py-3 text-left shadow-2xl ring-1 ring-black/20 backdrop-blur-md"
      >
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold tracking-tight text-zinc-50">
            {opts.title}
          </span>
          <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-zinc-400">
            {opts.body}
          </span>
        </span>
      </button>
    ),
    { duration: opts.duration ?? 8_000, unstyled: true },
  );
}
