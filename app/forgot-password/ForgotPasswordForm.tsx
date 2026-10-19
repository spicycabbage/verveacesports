"use client";

import { useState, useTransition } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/actions/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function ForgotPasswordForm() {
  const dict = useDictionary();
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-accent p-3 text-sm">
        <MailCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>{dict.auth.resetLinkSent}</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const email = String(new FormData(e.currentTarget).get("email"));
        start(async () => {
          const res = await requestPasswordReset({ email });
          if (res.error) toast.error(res.error);
          else setSent(true);
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="forgot-email">{dict.auth.email}</Label>
        <Input id="forgot-email" name="email" type="email" required autoComplete="email" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : dict.auth.sendResetLink}
      </Button>
    </form>
  );
}
