import { cookies } from "next/headers";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { CartButton } from "./CartButton";
import { SearchBar } from "./SearchBar";
import { GeoMarketHydrator } from "./GeoMarketHydrator";
import { LocaleHydrator } from "./LocaleHydrator";
import { LanguageSelector } from "./LanguageSelector";
import {
  HeaderCategoryNav,
  type NavMegaCategory,
  type NavMegaProduct,
} from "./HeaderCategoryNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { profileDisplayName } from "@/lib/utils/profileDisplayName";
import { parseMarketCookie, MARKET_COOKIE } from "@/lib/geo/market";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";
import { getSite } from "@/lib/site/get-site";
import type { Category } from "@/lib/constants";

/** One row in the mega menu — keep low enough that cards don't wrap. */
const MEGA_PRODUCT_LIMIT = 5;

function productImage(images: unknown): string | null {
  if (!Array.isArray(images)) return null;
  const first = images.find((img): img is string => typeof img === "string" && img.length > 0);
  return first ?? null;
}

export async function Header() {
  const site = await getSite();
  const cookieStore = await cookies();
  const market = parseMarketCookie(cookieStore.get(MARKET_COOKIE)?.value);
  const locale = parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = getDictionary(locale);

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

  const { data: productRows } = await supabase
    .from("products")
    .select("id, slug, name, category, images")
    .eq("is_active", true)
    .in("category", [...site.categories])
    .order("created_at", { ascending: false });

  type NavProductRow = {
    id: string;
    slug: string;
    name: string;
    category: string | null;
    images: unknown;
  };

  const byCategory = new Map<string, NavMegaProduct[]>();
  for (const row of (productRows ?? []) as NavProductRow[]) {
    const category = row.category;
    if (!category) continue;
    const list = byCategory.get(category) ?? [];
    if (list.length >= MEGA_PRODUCT_LIMIT) continue;
    list.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      image: productImage(row.images),
    });
    byCategory.set(category, list);
  }

  const navCategories: NavMegaCategory[] = site.categories.map((c) => ({
    id: c as Category,
    label: categoryLabelFromDict(dict, c),
    href: `/products?category=${c}`,
    products: byCategory.get(c) ?? [],
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <GeoMarketHydrator market={market} />
      <LocaleHydrator locale={locale} />
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-3 px-3 sm:h-[5.2rem] sm:gap-4 sm:px-4">
        <MobileNav categories={site.categories} />
        <Logo className="shrink-0 sm:flex-none" />
        <HeaderCategoryNav
          categories={navCategories}
          faqLabel={dict.nav.faq}
          viewAllLabel={dict.home.viewAll}
        />
        <SearchBar className="hidden min-w-0 flex-1 lg:block lg:max-w-md" />
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
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
