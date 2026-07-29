"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { markNewsletterSubscribed } from "@/lib/newsletter/storage";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function DrawSignupForm() {
  const dict = useDictionary();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

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
          source: "bleeq-ca-draw",
        }),
      });
      const data = (await res.json()) as { error?: string; alreadySubscribed?: boolean };

      if (!res.ok) {
        toast.error(data.error ?? dict.newsletter.toastError);
        return;
      }

      markNewsletterSubscribed();
      setDone(true);
      toast.success(
        data.alreadySubscribed
          ? dict.newsletter.toastAlready
          : dict.draw.toastSuccess,
      );
    } catch {
      toast.error(dict.newsletter.toastConnError);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-5 text-center text-sm font-medium text-foreground">
        {dict.draw.entered}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="draw-email">{dict.newsletter.email}</Label>
        <Input
          id="draw-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={dict.newsletter.emailPlaceholder}
          disabled={submitting}
        />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="animate-spin" />
            {dict.newsletter.subscribing}
          </>
        ) : (
          dict.draw.cta
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {dict.draw.finePrint}{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          {dict.footer.privacyPolicy}
        </Link>
        .
      </p>
    </form>
  );
}
