"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signInWithGoogle, signUpWithPassword } from "@/lib/actions/auth";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function SignupForm() {
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => start(async () => { await signInWithGoogle(); })}
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          OR
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
            else toast.success("Check your email to confirm your account.");
          });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="signup-first">First name</Label>
            <Input
              id="signup-first"
              name="firstName"
              required
              autoComplete="given-name"
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-last">Last name</Label>
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
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">Min 8 characters.</p>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 1 1-3.4-13l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.7 1.2 7.8 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2A12 12 0 0 1 12.7 28l-6.6 5.1A20 20 0 0 0 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.3 5.2C42.4 35.2 44 30.1 44 24c0-1.2-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
