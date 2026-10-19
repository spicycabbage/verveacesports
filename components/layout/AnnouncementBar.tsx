"use client";

import { useState, type MouseEvent } from "react";
import { XIcon } from "lucide-react";
import { ANNOUNCEMENT_CODE } from "@/lib/layout/announcement";

type Props = {
  text: string;
  cookieName: string;
  closeLabel: string;
  campaignId?: string;
};

function AnnouncementPromo({ text, campaignId }: { text: string; campaignId: string }) {
  const i = text.indexOf(campaignId);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="mx-0.5 inline-flex items-center rounded-[0.28rem] border border-dashed border-[#e4c56a] px-1.5 py-px font-semibold tracking-wide text-[#e4c56a]">
        {campaignId}
      </span>
      {text.slice(i + campaignId.length)}
    </>
  );
}

export function AnnouncementBar({
  text,
  cookieName,
  closeLabel,
  campaignId = ANNOUNCEMENT_CODE,
}: Props) {
  const [visible, setVisible] = useState(true);

  const dismiss = (event: MouseEvent<HTMLButtonElement>) => {
    document.cookie = `${cookieName}=${encodeURIComponent(campaignId)}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax`;
    const root =
      event.currentTarget.closest<HTMLElement>("[data-site-header]") ??
      event.currentTarget.closest("header");
    root?.style.setProperty("--announce-h", "0px");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative border-b border-border/60 bg-muted/40">
      <p
        translate="no"
        className="notranslate mx-auto flex min-h-9 min-w-0 max-w-7xl items-center justify-center px-11 py-1.5 text-center text-[11px] font-medium leading-snug tracking-wide text-pretty text-muted-foreground sm:px-12 sm:text-xs lg:text-sm"
      >
        <AnnouncementPromo text={text} campaignId={campaignId} />
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-foreground/70 hover:bg-foreground/10 hover:text-foreground sm:right-3"
        aria-label={closeLabel}
        title={closeLabel}
      >
        <XIcon className="h-4 w-4" strokeWidth={2.25} />
      </button>
    </div>
  );
}
