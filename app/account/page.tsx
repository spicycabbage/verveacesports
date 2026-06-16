import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { ProfileForm } from "./ProfileForm";
import { formatPoints } from "@/lib/utils/format";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, first_name, last_name, email, country, loyalty_points, referral_code, created_at")
    .eq("id", user!.id)
    .single<{
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
      email: string;
      country: "US" | "CA";
      loyalty_points: number;
      referral_code: string;
      created_at: string;
    }>();

  const pf = (profile?.first_name ?? "").trim();
  const pl = (profile?.last_name ?? "").trim();
  const legacy = (profile?.full_name ?? "").trim();
  const legacyParts = legacy ? legacy.split(/\s+/).filter(Boolean) : [];
  const derivedFirst = pf || legacyParts[0] || "";
  const derivedLast = pl || legacyParts.slice(1).join(" ") || "";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Loyalty points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {formatPoints(profile?.loyalty_points ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Worth ${((profile?.loyalty_points ?? 0) / 100).toFixed(2)} at checkout
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Member since</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {profile
                ? new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{profile?.email}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Keep your details up to date.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            email={profile?.email ?? ""}
            firstName={derivedFirst}
            lastName={derivedLast}
            country={profile?.country ?? "US"}
            referralCode={profile?.referral_code ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
