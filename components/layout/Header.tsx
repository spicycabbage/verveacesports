import { cookies } from "next/headers";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { CartButton } from "./CartButton";
import { SearchBar } from "./SearchBar";
import { GeoMarketHydrator } from "./GeoMarketHydrator";
import { MarketBadge } from "./MarketBadge";
import { LocaleHydrator } from "./LocaleHydrator";
import { LanguageSelector } from "./LanguageSelector";
import {
  HeaderCategoryNav,
  type NavCartFeature,
  type NavMegaCategory,
} from "./HeaderCategoryNav";
import { getSessionProfile, getSessionUser } from "@/lib/auth/session";
import { getCachedNavProducts } from "@/lib/catalog/nav-products";
import { isAdminPath } from "@/lib/request/pathname";
import { profileDisplayName } from "@/lib/utils/profileDisplayName";
import { parseMarketCookie, MARKET_COOKIE } from "@/lib/geo/market";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";
import { getSite } from "@/lib/site/get-site";
import type { Category } from "@/lib/constants";
import {
  CART_FEATURE_IDS,
  cartHasFeature,
  type CartFeatureId,
} from "@/lib/catalog/cart-features";

const ANNOUNCEMENT_CODE = "fondo2026";

function AnnouncementPromo({ text }: { text: string }) {
  const i = text.indexOf(ANNOUNCEMENT_CODE);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="mx-0.5 inline-flex items-center rounded-[0.28rem] border border-dashed border-[#e4c56a] px-1.5 py-px font-semibold tracking-wide text-[#e4c56a]">
        {ANNOUNCEMENT_CODE}
      </span>
      {text.slice(i + ANNOUNCEMENT_CODE.length)}
    </>
  );
}

export async function Header() {
  const [site, cookieStore, user, profile, adminRoute] = await Promise.all([
    getSite(),
    cookies(),
    getSessionUser(),
    getSessionProfile(),
    isAdminPath(),
  ]);
  const market = parseMarketCookie(cookieStore.get(MARKET_COOKIE)?.value);
  const locale = parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = getDictionary(locale);

  const nav = adminRoute
    ? { byCategory: {}, electricCartProducts: [] }
    : await getCachedNavProducts(site.categories);
  const byCategory = nav.byCategory;
  const electricCartProducts = nav.electricCartProducts;

  const cartFeatureLabels: Record<CartFeatureId, string> = {
    "follow-me": dict.cartFeatures.followMe,
    remote: dict.cartFeatures.remote,
    "no-remote": dict.cartFeatures.noRemote,
    gps: dict.cartFeatures.gps,
  };

  const cartFeatures: NavCartFeature[] = CART_FEATURE_IDS.map((id) => ({
    id,
    label: cartFeatureLabels[id],
    products: electricCartProducts.filter((p) => cartHasFeature(p.slug, id)),
  })).filter((f) => f.products.length > 0);

  const navCategories: NavMegaCategory[] = site.categories.map((c) => {
    const base: NavMegaCategory = {
      id: c as Category,
      label: categoryLabelFromDict(dict, c),
      href: `/products?category=${c}`,
      products: byCategory[c] ?? [],
    };
    if (c === "electric-carts") {
      return { ...base, products: [], cartFeatures };
    }
    return base;
  });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <GeoMarketHydrator market={market} />
      <LocaleHydrator locale={locale} />
      <div className="border-b border-border/60 bg-muted/40">
        <p className="mx-auto flex h-9 max-w-7xl items-center justify-center px-3 text-center text-[11px] font-medium tracking-wide text-muted-foreground sm:text-xs lg:text-sm">
          <AnnouncementPromo text={dict.bleeq.trust.promo} />
        </p>
      </div>
      <div className="mx-auto flex h-14 min-w-0 w-full max-w-7xl items-center gap-1.5 px-2 sm:h-[5.2rem] sm:gap-4 sm:px-4">
        <MobileNav
          categories={site.categories}
          cartFeatures={cartFeatures}
          isAdmin={profile?.is_admin ?? false}
        />
        <Logo className="shrink-0" />
        <HeaderCategoryNav
          categories={navCategories}
          faqLabel={dict.nav.faq}
          viewAllLabel={dict.home.viewAll}
          pickCartCategoryLabel={dict.cartFeatures.pickCategory}
        />
        <SearchBar className="hidden min-w-0 flex-1 lg:block lg:max-w-md" />
        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2.5">
          <MarketBadge className="hidden sm:flex" />
          <LanguageSelector className="hidden sm:flex" />
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
