import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseMarketCookie, MARKET_COOKIE } from "@/lib/geo/market";
import { CheckoutClient } from "./CheckoutClient";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return { title: dict.checkout.title, robots: { index: false, follow: false } };
}

function splitLegacyFullName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export default async function CheckoutPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/checkout");

  const cookieStore = await cookies();
  const defaultMarket = parseMarketCookie(cookieStore.get(MARKET_COOKIE)?.value);
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, first_name, last_name, email, loyalty_points")
    .eq("id", user.id)
    .single<{
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
      email: string;
      loyalty_points: number;
    }>();

  const first = (profile?.first_name ?? "").trim();
  const last = (profile?.last_name ?? "").trim();
  const legacy = splitLegacyFullName(profile?.full_name ?? "");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">{dict.checkout.title}</h1>
      <CheckoutClient
        defaultMarket={defaultMarket}
        defaultFirstName={first || legacy.first}
        defaultLastName={last || legacy.last}
        loyaltyPoints={profile?.loyalty_points ?? 0}
      />
    </div>
  );
}
