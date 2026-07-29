import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";
import { ReferralCard } from "./ReferralCard";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return { title: dict.account.referrals };
}

export default async function ReferralsPage() {
  const supabase = await createSupabaseServerClient();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user!.id)
    .single<{ referral_code: string }>();

  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, referee_id, status, qualified_at, created_at")
    .eq("referrer_id", user!.id)
    .order("created_at", { ascending: false });

  const total = referrals?.length ?? 0;
  const qualified = referrals?.filter((r) => r.status === "qualified").length ?? 0;
  const pointsEarned = qualified * 100;
  const code = profile?.referral_code ?? "";

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-accent to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" /> {dict.account.referralsTitle}
          </CardTitle>
          <CardDescription>{dict.account.referralsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <ReferralCard code={code} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Friends invited" value={total} />
        <Stat label="Qualified purchases" value={qualified} />
        <Stat label="Points earned" value={pointsEarned} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="space-y-0 pb-1">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
