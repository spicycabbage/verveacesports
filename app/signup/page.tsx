import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignupForm } from "./SignupForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from "next/headers";
import { REFERRAL_COOKIE } from "@/lib/constants";
import { Sparkles } from "lucide-react";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return {
    title: dict.auth.createAccount,
    robots: { index: false, follow: false },
  };
}

export default async function SignupPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/account");

  const c = await cookies();
  const refCode = c.get(REFERRAL_COOKIE)?.value ?? null;
  const dict = getDictionary(parseLocaleCookie(c.get(LOCALE_COOKIE)?.value));

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{dict.auth.createTitle}</CardTitle>
          <CardDescription>{dict.auth.createDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {refCode && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-primary/30 bg-accent p-3 text-sm">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium">{interpolate(dict.auth.referredBy, { code: refCode })}</p>
                <p className="text-xs text-muted-foreground">{dict.auth.referralBonus}</p>
              </div>
            </div>
          )}
          <SignupForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {dict.auth.alreadyHave}{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {dict.auth.signIn}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
