"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ReferralCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${code}`
      : `https://verveacesports.com/?ref=${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "VerveaceSports",
          text: "Join VerveaceSports and we both score bonus points!",
          url: link,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Your code</span>
        <div className="text-2xl font-mono font-bold tracking-wider">{code}</div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input value={link} readOnly className="min-w-0 font-mono text-xs sm:text-sm" />
        <div className="flex gap-2">
          <Button onClick={copy} variant="outline" className="flex-1 sm:flex-none">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button onClick={share} className="flex-1 sm:flex-none">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}
