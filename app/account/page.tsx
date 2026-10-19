import Link from "next/link";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { formatDateOnly, formatPoints } from "@/lib/utils/format";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, first_name, last_name, email, loyalty_points, referral_code, created_at")
    .eq("id", user!.id)
    .single<{
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
      email: string;
      loyalty_points: number;
      referral_code: string;
      created_at: string;
    }>();

  const name =
    `${(profile?.first_name ?? "").trim()} ${(profile?.last_name ?? "").trim()}`.trim() ||
    (profile?.full_name ?? "").trim();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> {dict.account.loyaltyPoints}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {formatPoints(profile?.loyalty_points ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {interpolate(dict.account.worthAtCheckout, {
                amount: ((profile?.loyalty_points ?? 0) / 100).toFixed(2),
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>{dict.account.memberSince}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {profile
                ? formatDateOnly(profile.created_at)
                : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{profile?.email}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dict.account.profileTitle}</CardTitle>
          <CardDescription>{dict.account.profileDesc}</CardDescription>
          <CardAction>
            <Link
              href="/account/settings"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {dict.account.editInSettings}
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div className="min-w-0 space-y-1">
              <dt className="text-muted-foreground">{dict.account.name}</dt>
              <dd className="truncate font-medium">{name || "—"}</dd>
            </div>
            <div className="min-w-0 space-y-1">
              <dt className="text-muted-foreground">{dict.account.email}</dt>
              <dd className="truncate font-medium">{profile?.email ?? "—"}</dd>
            </div>
            <div className="min-w-0 space-y-1">
              <dt className="text-muted-foreground">{dict.account.yourReferralCode}</dt>
              <dd className="font-mono font-medium uppercase">{profile?.referral_code ?? "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
