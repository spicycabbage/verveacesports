"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  markNewsletterDismissed,
  markNewsletterSubscribed,
  shouldShowNewsletterPopup,
} from "@/lib/newsletter/storage";

const POPUP_DELAY_MS = 2500;

export function NewsletterPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;

    const timer = window.setTimeout(() => {
      if (shouldShowNewsletterPopup()) {
        setOpen(true);
      }
    }, POPUP_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isAdminRoute, pathname]);

  const closePopup = (dismissed: boolean) => {
    setOpen(false);
    if (dismissed) {
      markNewsletterDismissed();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "popup" }),
      });
      const data = (await res.json()) as { error?: string; alreadySubscribed?: boolean };

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong. Try again.");
        return;
      }

      markNewsletterSubscribed();
      setOpen(false);
      toast.success(
        data.alreadySubscribed
          ? "You're already on the list — thanks!"
          : "You're subscribed. Watch your inbox for updates.",
      );
    } catch {
      toast.error("Could not subscribe. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAdminRoute) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closePopup(true);
        else setOpen(true);
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="border-b bg-primary/10 px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Mail className="h-6 w-6" />
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-xl sm:text-2xl">Stay in the loop</DialogTitle>
            <DialogDescription className="max-w-sm text-base">
              Get BleeqUp drops, exclusive deals, and new product alerts from VerveaceSports.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="newsletter-email">Email address</Label>
            <Input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
              className="h-10"
            />
          </div>

          <Button type="submit" className="h-10 w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="animate-spin" />
                Subscribing…
              </>
            ) : (
              "Subscribe"
            )}
          </Button>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Unsubscribe anytime. See our{" "}
            <Link href="/privacy" className="text-primary hover:underline" onClick={() => closePopup(true)}>
              Privacy Policy
            </Link>
            .
          </p>

          <button
            type="button"
            className="mx-auto block text-sm text-muted-foreground hover:text-foreground"
            onClick={() => closePopup(true)}
            disabled={submitting}
          >
            No thanks
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
