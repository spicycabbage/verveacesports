import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PASSWORD_RESET_COOKIE } from "@/lib/auth/cookies";
import { getSessionUser } from "@/lib/auth/session";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return { title: dict.auth.resetTitle, robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const user = await getSessionUser();
  if (!user || cookieStore.get(PASSWORD_RESET_COOKIE)?.value !== user.id) {
    redirect("/forgot-password?error=expired");
  }

  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));

  return (
    <div className="mx-auto min-w-0 max-w-md px-4 py-12">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{dict.auth.resetTitle}</CardTitle>
          <CardDescription className="text-pretty">{dict.auth.resetDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm email={user.email ?? ""} />
        </CardContent>
      </Card>
    </div>
  );
}
