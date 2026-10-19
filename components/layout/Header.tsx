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
  type NavCartFeature,
  type NavMegaCategory,
} from "./HeaderCategoryNav";
import { VoltNav } from "./VoltNav";
import { getSessionProfile, getSessionUser } from "@/lib/auth/session";
import { getCachedNavProducts } from "@/lib/catalog/nav-products";
import { isAdminPath } from "@/lib/request/pathname";
import { profileDisplayName } from "@/lib/utils/profileDisplayName";
import { parseMarketCookie, MARKET_COOKIE } from "@/lib/geo/market";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";
import { resolveRequestLocale } from "@/lib/i18n/request-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";
import { catalogProductName } from "@/lib/i18n/catalog-copy";
import { getSite } from "@/lib/site/get-site";
import type { Category } from "@/lib/constants";
import { AnnouncementBar } from "./AnnouncementBar";
import {
  ANNOUNCEMENT_CODE,
  ANNOUNCEMENT_ENABLED,
  announcementCookieMatches,
  announcementCookieName,
} from "@/lib/layout/announcement";
import {
  CART_FEATURE_IDS,
  cartHasFeature,
  type CartFeatureId,
} from "@/lib/catalog/cart-features";

export async function Header() {
  const [site, cookieStore, user, profile, adminRoute] = await Promise.all([
    getSite(),
    cookies(),
    getSessionUser(),
    getSessionProfile(),
    isAdminPath(),
  ]);
  const market = parseMarketCookie(cookieStore.get(MARKET_COOKIE)?.value);
  const locale = await resolveRequestLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = getDictionary(locale);

  const isVolt = site.id === "volt-ca";
  const nav = adminRoute || isVolt
    ? { byCategory: {}, electricCartProducts: [] }
    : await getCachedNavProducts(
        site.categories,
        site.brand ? `${site.brand}-` : null,
      );
  const localizeNav = (
    products: { id: string; slug: string; name: string; image: string | null; translations?: unknown }[],
  ) =>
    products.map((p) => ({
      ...p,
      name: catalogProductName(p.slug, locale, p.name, p.translations),
    }));
  const byCategory = Object.fromEntries(
    Object.entries(nav.byCategory).map(([key, products]) => [key, localizeNav(products)]),
  );
  const electricCartProducts = localizeNav(nav.electricCartProducts);

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

  const announceCookie = cookieStore.get(announcementCookieName(site.storagePrefix))?.value;
  const showAnnounce =
    ANNOUNCEMENT_ENABLED && site.id !== "volt-ca" && !announcementCookieMatches(announceCookie, ANNOUNCEMENT_CODE);

  return (
    <header
      data-site-header
      className="min-w-0 w-full overflow-x-clip border-b border-border bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85"
      style={{ ["--announce-h" as string]: showAnnounce ? "2.25rem" : "0px" }}
    >
      <GeoMarketHydrator market={market} />
      <LocaleHydrator locale={locale} />
      {showAnnounce ? (
        <AnnouncementBar
          text={dict.bleeq.trust.promo}
          cookieName={announcementCookieName(site.storagePrefix)}
          closeLabel={dict.common.close}
        />
      ) : null}
      <div
        className={
          isVolt
            ? "flex h-14 min-w-0 w-full items-center gap-3 px-3 sm:h-16 sm:gap-6 sm:px-6 lg:px-10"
            : "mx-auto flex h-14 min-w-0 w-full max-w-7xl items-center gap-1.5 px-2 sm:h-[5.2rem] sm:gap-4 sm:px-4"
        }
      >
        <MobileNav
          categories={site.categories}
          cartFeatures={cartFeatures}
          isAdmin={profile?.is_admin ?? false}
        />
        <Logo className="shrink-0" />
        {isVolt ? (
          <VoltNav className="hidden lg:flex" />
        ) : (
          <HeaderCategoryNav
            categories={navCategories}
            faqLabel={dict.nav.faq}
            viewAllLabel={dict.home.viewAll}
            pickCartCategoryLabel={dict.cartFeatures.pickCategory}
          />
        )}
        {isVolt ? null : (
          <SearchBar className="hidden min-w-0 flex-1 lg:block lg:max-w-md" />
        )}
        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2.5">
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
