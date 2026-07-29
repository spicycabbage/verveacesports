import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getSite } from "@/lib/site/get-site";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return { title: dict.auth.signIn, robots: { index: false, follow: false } };
}

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/account");

  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{dict.auth.welcomeBack}</CardTitle>
          <CardDescription>
            {dict.auth.signInDesc.replace("VerveaceSports", site.name)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
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
