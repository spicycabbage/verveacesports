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

  const loadProfile = (columns: string) =>
    supabase.from("profiles").select(columns).eq("id", user.id).single<{
      full_name: string | null;
      first_name: string | null;
      last_name: string | null;
      email: string;
      loyalty_points: number;
      country: string | null;
      phone?: string | null;
      default_address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
      } | null;
    }>();
  const baseColumns = "full_name, first_name, last_name, email, loyalty_points, country";

  const [profileRes, { data: lastOrder }] = await Promise.all([
    loadProfile(`${baseColumns}, phone, default_address`),
    supabase
      .from("orders")
      .select("shipping_address, country")
      .eq("user_id", user.id)
      .not("shipping_address", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{
        shipping_address: {
          full_name?: string;
          line1?: string;
          line2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          phone?: string;
          country?: string;
        } | null;
        country: string | null;
      }>(),
  ]);
  // phone/default_address come from migration 0047; don't let a missing column blank checkout.
  const profile = profileRes.error ? (await loadProfile(baseColumns)).data : profileRes.data;

  const first = (profile?.first_name ?? "").trim();
  const last = (profile?.last_name ?? "").trim();
  const legacy = splitLegacyFullName(profile?.full_name ?? "");
  const saved = profile?.default_address?.line1 ? profile.default_address : null;
  const lastAddr = lastOrder?.shipping_address;
  const addr = saved ?? lastAddr;
  const fromAddr = splitLegacyFullName(lastAddr?.full_name ?? "");
  const isCountry = (c: unknown): c is "US" | "CA" => c === "US" || c === "CA";
  const savedCountry = saved && isCountry(profile?.country)
    ? profile.country
    : isCountry(lastAddr?.country)
      ? lastAddr.country
      : isCountry(lastOrder?.country)
        ? lastOrder.country
        : defaultMarket;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">{dict.checkout.title}</h1>
      <CheckoutClient
        defaultMarket={savedCountry}
        defaultFirstName={first || fromAddr.first || legacy.first}
        defaultLastName={last || fromAddr.last || legacy.last}
        defaultLine1={addr?.line1?.trim() ?? ""}
        defaultLine2={addr?.line2?.trim() ?? ""}
        defaultCity={addr?.city?.trim() ?? ""}
        defaultState={addr?.state?.trim() ?? ""}
        defaultPostal={addr?.postal_code?.trim() ?? ""}
        defaultPhone={profile?.phone?.trim() || lastAddr?.phone?.trim() || ""}
        loyaltyPoints={profile?.loyalty_points ?? 0}
      />
    </div>
  );
}
