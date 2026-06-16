import Link from "next/link";
import { cookies } from "next/headers";
import { Logo } from "./Logo";
import { MarketBadge } from "./MarketBadge";
import { UserMenu } from "./UserMenu";
import { CartButton } from "./CartButton";
import { SearchBar } from "./SearchBar";
import { GeoMarketHydrator } from "./GeoMarketHydrator";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileDisplayName } from "@/lib/utils/profileDisplayName";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import { parseMarketCookie, MARKET_COOKIE } from "@/lib/geo/market";

export async function Header() {
  const cookieStore = await cookies();
  const market = parseMarketCookie(cookieStore.get(MARKET_COOKIE)?.value);

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
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <GeoMarketHydrator market={market} />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-4 lg:flex">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/products?category=${c}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {categoryLabel(c)}
            </Link>
          ))}
        </nav>
        <SearchBar className="hidden flex-1 md:block md:max-w-sm" />
        <div className="ml-auto flex items-center gap-1">
          <MarketBadge />
          <CartButton />
          <UserMenu
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
        </div>
      </div>
      <div className="border-t md:hidden">
        <div className="mx-auto max-w-7xl px-4 py-2">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
