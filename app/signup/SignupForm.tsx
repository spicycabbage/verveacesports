"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { signUpWithPassword } from "@/lib/actions/auth";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { useDictionary } from "@/lib/i18n/I18nProvider";

export function SignupForm() {
  const [pending, start] = useTransition();
  const dict = useDictionary();

  return (
    <div className="space-y-4">
      <GoogleSignInButton label={dict.auth.continueGoogle} />

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          {dict.auth.or}
        </span>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const res = await signUpWithPassword({
              email: String(fd.get("email")),
              password: String(fd.get("password")),
              firstName: String(fd.get("firstName")),
              lastName: String(fd.get("lastName")),
            });
            if (res?.error) toast.error(res.error);
            else toast.success(dict.auth.checkEmailConfirm);
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="signup-first">{dict.auth.firstName}</Label>
            <Input
              id="signup-first"
              name="firstName"
              required
              autoComplete="given-name"
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-last">{dict.auth.lastName}</Label>
            <Input
              id="signup-last"
              name="lastName"
              required
              autoComplete="family-name"
              maxLength={80}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-email">{dict.auth.email}</Label>
          <Input id="signup-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-password">{dict.auth.password}</Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">{dict.auth.min8}</p>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : dict.auth.createAccount}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {dict.auth.agreeTerms}{" "}
          <Link href="/terms" className="text-primary hover:underline">
            {dict.auth.terms}
          </Link>{" "}
          {dict.auth.and}{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            {dict.auth.privacyPolicy}
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
