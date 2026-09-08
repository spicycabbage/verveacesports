"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { CalendarDays, ExternalLink, Loader2, Mail, MapPin, X } from "lucide-react";
import { toast } from "sonner";
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
const EXPO_URL =
  "https://www.rbcgranfondo.com/event-resources/whistler/velospoke-bike-expo";
// Expo runs Fri Sept 11, 2026, 11am–8pm PT. Stop promoting at midnight PT (07:00 UTC Sept 12).
const EXPO_ENDS_AT = Date.parse("2026-09-12T07:00:00Z");

export function NewsletterPopup() {
  const pathname = usePathname();
  const site = useSite();
  const dict = useDictionary();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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
  const showExpo = Date.now() < EXPO_ENDS_AT;
  const blocked = isAdminRoute || isDrawPage || isAuthSurface;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (blocked) return;

    const force = new URLSearchParams(window.location.search).get("newsletter") === "1";
    const timer = window.setTimeout(
      () => {
        if (force || shouldShowNewsletterPopup(site.id)) {
          setOpen(true);
        }
      },
      force ? 200 : POPUP_DELAY_MS,
    );

    return () => window.clearTimeout(timer);
  }, [blocked, pathname, site.id]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        markNewsletterDismissed(site.id);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, site.id]);

  const closePopup = () => {
    markNewsletterDismissed(site.id);
    setOpen(false);
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

      markNewsletterSubscribed(site.id);
      setOpen(false);
      toast.success(
        data.alreadySubscribed ? dict.newsletter.toastAlready : dict.newsletter.toastSuccess,
      );
    } catch {
      toast.error(dict.newsletter.toastConnError);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || blocked || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/65"
        aria-label={dict.common.close}
        onClick={closePopup}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/10"
      >
        <button
          type="button"
          onClick={closePopup}
          disabled={submitting}
          className={
            showExpo
              ? "absolute top-2 right-2 z-10 inline-flex size-10 items-center justify-center rounded-full bg-black/70 text-white ring-1 ring-white/50 hover:bg-black/85"
              : "absolute top-2 right-2 z-10 inline-flex size-10 items-center justify-center rounded-full bg-background/90 text-foreground ring-1 ring-border hover:bg-background"
          }
          aria-label={dict.common.close}
        >
          <X className="size-5" />
        </button>

        <div className="min-h-0 overflow-y-auto overscroll-contain">
          {showExpo ? (
            <div className="relative overflow-hidden bg-black px-4 pb-4 pt-5 pr-14 text-white sm:px-6 sm:pb-6 sm:pt-7">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/30 blur-3xl sm:h-56 sm:w-56"
              />
              <div className="relative space-y-2 sm:space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary sm:text-xs">
                  {dict.newsletter.eventKicker}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h2 id={titleId} className="text-xl font-bold tracking-tight sm:text-3xl">
                    {dict.newsletter.eventName}
                  </h2>
                  <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-primary-foreground sm:px-3 sm:py-1 sm:text-sm">
                    {dict.newsletter.eventBooth}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-sm text-white/80 sm:gap-1.5">
                  <p className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{dict.newsletter.eventMeta}</span>
                  </p>
                  <a
                    href={EXPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-white underline-offset-4 hover:underline"
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    {dict.newsletter.eventLink}
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-b bg-primary/10 px-4 py-5 pr-14 text-center sm:px-6 sm:py-8">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground sm:mb-4 sm:h-12 sm:w-12">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h2 id={titleId} className="text-lg font-semibold sm:text-2xl">
                {dict.newsletter.title}
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground sm:text-base">
                {isBleeq ? dict.newsletter.descBleeq : dict.newsletter.descVerveace}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4 sm:space-y-4 sm:px-6 sm:py-6">
            {showExpo && (
              <p className="text-sm font-medium leading-snug text-foreground sm:text-base">
                {dict.newsletter.eventDesc}
              </p>
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
                autoFocus
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
              onClick={closePopup}
              disabled={submitting}
            >
              {dict.newsletter.noThanks}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
