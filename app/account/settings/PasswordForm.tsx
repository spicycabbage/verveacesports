"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/lib/actions/profile";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function PasswordForm({ email, hasPassword }: { email: string; hasPassword: boolean }) {
  const dict = useDictionary();
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const newPassword = String(fd.get("newPassword"));
        if (newPassword !== String(fd.get("confirm"))) {
          toast.error(dict.auth.passwordsDontMatch);
          return;
        }
        start(async () => {
          const res = await changePassword({
            currentPassword: hasPassword ? String(fd.get("currentPassword")) : undefined,
            newPassword,
          });
          if (res.error) toast.error(res.error);
          else {
            toast.success(dict.auth.passwordUpdated);
            form.reset();
          }
        });
      }}
    >
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      {hasPassword && (
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="settings-current-password">{dict.account.currentPassword}</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              {dict.auth.forgotPassword}
            </Link>
          </div>
          <Input
            id="settings-current-password"
            name="currentPassword"
            type="password"
            required
            maxLength={72}
            autoComplete="current-password"
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="settings-new-password">{dict.auth.newPassword}</Label>
        <Input
          id="settings-new-password"
          name="newPassword"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">{dict.auth.min8}</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="settings-confirm-password">{dict.auth.confirmPassword}</Label>
        <Input
          id="settings-confirm-password"
          name="confirm"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasPassword ? (
            dict.account.changePassword
          ) : (
            dict.account.setPassword
          )}
        </Button>
      </div>
    </form>
  );
}
