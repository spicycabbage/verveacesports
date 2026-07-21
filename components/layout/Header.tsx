import Link from "next/link";
import { cookies } from "next/headers";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { CartButton } from "./CartButton";
import { SearchBar } from "./SearchBar";
import { GeoMarketHydrator } from "./GeoMarketHydrator";
import { LocaleHydrator } from "./LocaleHydrator";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileDisplayName } from "@/lib/utils/profileDisplayName";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import { parseMarketCookie, MARKET_COOKIE } from "@/lib/geo/market";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";

export async function Header() {
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <GeoMarketHydrator market={market} />
      <LocaleHydrator locale={locale} />
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4">
        <MobileNav />
        <Logo className="shrink-0 sm:flex-none" />
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
          <Link
            href="/faq"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            FAQ
          </Link>
        </nav>
        <SearchBar className="hidden min-w-0 flex-1 lg:block lg:max-w-sm" />
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <LanguageSelector className="hidden sm:flex" />
          <ThemeToggle />
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
    </header>
  );
}
