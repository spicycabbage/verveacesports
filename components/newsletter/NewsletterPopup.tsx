"use client";

import Image from "next/image";
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
import { useSite } from "@/lib/site/SiteProvider";
import { useDictionary } from "@/lib/i18n/I18nProvider";

const POPUP_DELAY_MS = 2500;

export function NewsletterPopup() {
  const pathname = usePathname();
  const site = useSite();
  const dict = useDictionary();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdminRoute = pathname.startsWith("/admin");
  const isDrawPage = pathname === "/draw";
  const isAuthSurface =
    pathname.startsWith("/account") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/callback") ||
    pathname.startsWith("/checkout");
  const isBleeq = site.id === "bleeq-ca";

  useEffect(() => {
    if (isAdminRoute || isDrawPage || isAuthSurface) return;

    const timer = window.setTimeout(() => {
      if (shouldShowNewsletterPopup()) {
        setOpen(true);
      }
    }, POPUP_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isAdminRoute, isDrawPage, isAuthSurface, pathname]);

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
        body: JSON.stringify({
          email: trimmed,
          source: isBleeq ? "bleeq-ca-popup" : "verveace-popup",
        }),
      });
      const data = (await res.json()) as { error?: string; alreadySubscribed?: boolean };

      if (!res.ok) {
        toast.error(data.error ?? dict.newsletter.toastError);
        return;
      }

      markNewsletterSubscribed();
      setOpen(false);
      toast.success(
        data.alreadySubscribed
          ? dict.newsletter.toastAlready
          : dict.newsletter.toastSuccess,
      );
    } catch {
      toast.error(dict.newsletter.toastConnError);
    } finally {
      setSubmitting(false);
    }
  };

  if (isAdminRoute || isDrawPage || isAuthSurface) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closePopup(true);
        else setOpen(true);
      }}
    >
      <DialogContent
        className={
          isBleeq
            ? "gap-0 overflow-hidden p-0 sm:max-w-lg"
            : "gap-0 overflow-hidden p-0 sm:max-w-md"
        }
      >
        {isBleeq ? (
          <div className="relative w-full overflow-hidden bg-black pb-[calc(56.25%+50px)] sm:pb-[calc(50%+50px)]">
            <Image
              src="/bleeq-newsletter-nbda.webp"
              alt="Meet BleeqUp at NBDA Canada 2026"
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 100vw, 512px"
              quality={82}
              priority
            />
          </div>
        ) : (
          <div className="border-b bg-primary/10 px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Mail className="h-6 w-6" />
            </div>
            <DialogHeader className="items-center text-center">
              <DialogTitle className="text-xl sm:text-2xl">{dict.newsletter.title}</DialogTitle>
              <DialogDescription className="max-w-sm text-base">
                {dict.newsletter.descVerveace}
              </DialogDescription>
            </DialogHeader>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {isBleeq && (
            <DialogHeader className="space-y-2 text-left sm:text-center">
              <DialogTitle className="sr-only">{dict.newsletter.title}</DialogTitle>
              <DialogDescription className="text-base font-medium leading-snug text-foreground">
                {dict.newsletter.descBleeq}
              </DialogDescription>
            </DialogHeader>
          )}

          <div className="space-y-2">
            <Label htmlFor="newsletter-email">{dict.newsletter.email}</Label>
            <Input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              placeholder={dict.newsletter.emailPlaceholder}
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
                {dict.newsletter.subscribing}
              </>
            ) : (
              dict.newsletter.subscribe
            )}
          </Button>

          <button
            type="button"
            className="mx-auto block text-sm text-muted-foreground hover:text-foreground"
            onClick={() => closePopup(true)}
            disabled={submitting}
          >
            {dict.newsletter.noThanks}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
