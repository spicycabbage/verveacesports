import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { AddressForm, type SavedAddress } from "./AddressForm";
import { PasswordForm } from "./PasswordForm";
import { PersonalForm } from "./PersonalForm";

export const metadata = { title: "Settings" };

type ProfileRow = {
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  country: "US" | "CA";
  phone?: string | null;
  default_address?: Partial<SavedAddress> | null;
};

const BASE_COLUMNS = "full_name, first_name, last_name, email, country";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profileRes, hasPasswordRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(`${BASE_COLUMNS}, phone, default_address`)
      .eq("id", user!.id)
      .single<ProfileRow>(),
    supabase.rpc("current_user_has_password"),
  ]);
  // Columns from 0047 may not exist yet — fall back so the page still renders.
  const profile = profileRes.error
    ? (
        await supabase
          .from("profiles")
          .select(BASE_COLUMNS)
          .eq("id", user!.id)
          .single<ProfileRow>()
      ).data
    : profileRes.data;

  const legacyParts = (profile?.full_name ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = (profile?.first_name ?? "").trim() || legacyParts[0] || "";
  const lastName = (profile?.last_name ?? "").trim() || legacyParts.slice(1).join(" ");
  const addr = profile?.default_address ?? {};
  // RPC missing (migration not applied) → treat as having a password so we still ask for it.
  const hasPassword = hasPasswordRes.error ? true : hasPasswordRes.data !== false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dict.account.personalTitle}</CardTitle>
          <CardDescription>{dict.account.personalDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalForm
            email={profile?.email ?? user!.email ?? ""}
            firstName={firstName}
            lastName={lastName}
            phone={profile?.phone ?? ""}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dict.account.addressTitle}</CardTitle>
          <CardDescription>{dict.account.addressDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <AddressForm
            address={{
              line1: addr.line1 ?? "",
              line2: addr.line2 ?? "",
              city: addr.city ?? "",
              state: addr.state ?? "",
              postal_code: addr.postal_code ?? "",
            }}
            country={profile?.country ?? "CA"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dict.account.passwordTitle}</CardTitle>
          <CardDescription>
            {hasPassword ? dict.account.passwordDescChange : dict.account.passwordDescSet}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm email={profile?.email ?? user!.email ?? ""} hasPassword={hasPassword} />
        </CardContent>
      </Card>
    </div>
  );
}
