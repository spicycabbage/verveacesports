"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { signInWithPassword } from "@/lib/actions/auth";
import { useDictionary } from "@/lib/i18n/I18nProvider";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function LoginForm({ nextPath = "/account" }: { nextPath?: string }) {
  const [pending, start] = useTransition();
  const dict = useDictionary();

  return (
    <div className="space-y-4">
      <GoogleSignInButton nextPath={nextPath} label={dict.auth.continueGoogle} />

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
          {dict.auth.or}
        </span>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const res = await signInWithPassword({
              email: String(fd.get("email")),
              password: String(fd.get("password")),
              next: nextPath,
            });
            if (res?.error) toast.error(res.error);
            else {
              toast.success(dict.auth.signedIn);
              // Hard navigate avoids soft-nav + refresh thrashing the mobile layout.
              window.location.assign(res.redirectTo ?? nextPath);
            }
          });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="login-email">{dict.auth.email}</Label>
          <Input id="login-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="login-password">{dict.auth.password}</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : dict.auth.signIn}
        </Button>
      </form>
    </div>
  );
}
