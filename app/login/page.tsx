import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LoginForm } from "./LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { postLoginPath, sanitizeAuthNext } from "@/lib/auth/post-login-path";
import { getSessionProfile, getSessionUser } from "@/lib/auth/session";
import { getSite } from "@/lib/site/get-site";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return { title: dict.auth.signIn, robots: { index: false, follow: false } };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = sanitizeAuthNext(next);

  const user = await getSessionUser();
  if (user) {
    const profile = await getSessionProfile();
    redirect(postLoginPath(nextPath, !!profile?.is_admin));
  }

  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));

  return (
    <div className="mx-auto min-w-0 max-w-md px-4 py-12">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{dict.auth.welcomeBack}</CardTitle>
          <CardDescription className="text-pretty">
            {dict.auth.signInDesc.replace("VerveaceSports", site.name)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm nextPath={nextPath} />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {dict.auth.noAccount}{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              {dict.auth.signUp}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
