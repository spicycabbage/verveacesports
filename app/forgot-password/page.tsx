import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return { title: dict.auth.forgotTitle, robots: { index: false, follow: false } };
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));

  return (
    <div className="mx-auto min-w-0 max-w-md px-4 py-12">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{dict.auth.forgotTitle}</CardTitle>
          <CardDescription className="text-pretty">{dict.auth.forgotDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          {error === "expired" && (
            <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {dict.auth.resetLinkExpired}
            </p>
          )}
          <ForgotPasswordForm />
          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            {dict.auth.backToSignIn}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
