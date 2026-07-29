import Link from "next/link";
import { cookies } from "next/headers";
import { Logo } from "./Logo";
import { getSite } from "@/lib/site/get-site";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";
import { categoryLabelFromDict } from "@/lib/i18n/helpers";

export async function Footer() {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">{dict.footer.tagline}</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{dict.footer.shop}</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {site.categories.map((c) => (
              <li key={c}>
                <Link href={`/products?category=${c}`} className="hover:text-foreground">
                  {categoryLabelFromDict(dict, c)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{dict.footer.account}</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/account" className="hover:text-foreground">
                {dict.footer.profile}
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="hover:text-foreground">
                {dict.footer.orders}
              </Link>
            </li>
            <li>
              <Link href="/account/loyalty" className="hover:text-foreground">
                {dict.footer.loyaltyPoints}
              </Link>
            </li>
            <li>
              <Link href="/account/referrals" className="hover:text-foreground">
                {dict.footer.referFriend}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">{dict.footer.help}</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${site.supportEmail}`} className="hover:text-foreground">
                {site.supportEmail}
              </a>
            </li>
            <li>
              <Link href="/faq" className="hover:text-foreground">
                {dict.footer.faq}
              </Link>
            </li>
            <li>
              <Link href="/warranty" className="hover:text-foreground">
                {dict.footer.warranty}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-foreground">
                {dict.footer.privacyPolicy}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-foreground">
                {dict.footer.termsOfService}
              </Link>
            </li>
            <li>
              <Link href="/theme" className="hover:text-foreground">
                {dict.footer.themePlayground}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground">
          <span>{interpolate(dict.footer.copyright, { year })}</span>
          <div className="flex gap-3">
            <Link href="/warranty" className="hover:text-foreground">
              {dict.footer.warranty}
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              {dict.footer.privacy}
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              {dict.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
