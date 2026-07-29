import { cookies } from "next/headers";
import { BleeqHeader } from "./BleeqHeader";
import { GeoMarketHydrator } from "@/components/layout/GeoMarketHydrator";
import { LocaleHydrator } from "@/components/layout/LocaleHydrator";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileDisplayName } from "@/lib/utils/profileDisplayName";
import { parseMarketCookie, MARKET_COOKIE } from "@/lib/geo/market";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";

/** Server wrapper: loads auth + hydrates market/locale for the Bleeq storefront. */
export async function BleeqHeaderShell() {
  const cookieStore = await cookies();
  const market = parseMarketCookie(cookieStore.get(MARKET_COOKIE)?.value);
  const locale = parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  type HeaderProfile = {
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
    loyalty_points: number;
    is_admin: boolean;
  };
  let profile: HeaderProfile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, first_name, last_name, loyalty_points, is_admin")
      .eq("id", user.id)
      .single<HeaderProfile>();
    if (data) profile = data;
  }

  return (
    <>
      <GeoMarketHydrator market={market} />
      <LocaleHydrator locale={locale} />
      <BleeqHeader
        user={
          user
            ? {
                email: user.email ?? "",
                fullName: profileDisplayName(profile ?? {}) || null,
              }
            : null
        }
        loyaltyPoints={profile?.loyalty_points ?? 0}
        isAdmin={profile?.is_admin ?? false}
      />
    </>
  );
}
