"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function ResetPasswordForm({ email }: { email: string }) {
  const dict = useDictionary();
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const password = String(fd.get("password"));
        if (password !== String(fd.get("confirm"))) {
          toast.error(dict.auth.passwordsDontMatch);
          return;
        }
        start(async () => {
          const res = await resetPassword({ password });
          if (res.error) toast.error(res.error);
          else {
            toast.success(dict.auth.passwordUpdated);
            window.location.assign(res.redirectTo ?? "/account");
          }
        });
      }}
    >
      {/* Lets password managers pair the new password with the right account. */}
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      <div className="space-y-1.5">
        <Label htmlFor="reset-password">{dict.auth.newPassword}</Label>
        <Input
          id="reset-password"
          name="password"
          type="password"
          minLength={8}
          maxLength={72}
          required
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">{dict.auth.min8}</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reset-confirm">{dict.auth.confirmPassword}</Label>
        <Input
          id="reset-confirm"
          name="confirm"
          type="password"
          minLength={8}
          maxLength={72}
          required
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : dict.auth.updatePassword}
      </Button>
    </form>
  );
}
