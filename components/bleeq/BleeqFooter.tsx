import Link from "next/link";
import { cookies } from "next/headers";
import { getSite } from "@/lib/site/get-site";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";

export async function BleeqFooter() {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-semibold tracking-tight">{site.shortName}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {dict.bleeq.header.canada}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {dict.bleeq.footer.blurb}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{dict.bleeq.footer.shopRanger}</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {site.rangerProducts.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`} className="hover:text-foreground">
                  {p.shortLabel}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products?category=ai-glasses" className="hover:text-foreground">
                {dict.bleeq.footer.allModels}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{dict.bleeq.footer.accessories}</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {site.accessoryProducts.map((p) => (
              <li key={p.slug}>
                <Link href={`/products/${p.slug}`} className="hover:text-foreground">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">{dict.bleeq.footer.support}</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/draw" className="hover:text-foreground">
                {dict.draw.navLabel}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-foreground">
                {dict.nav.faq}
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-foreground">
                {dict.nav.account}
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="hover:text-foreground">
                {dict.nav.orders}
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
              <a href={`mailto:${site.supportEmail}`} className="hover:text-foreground">
                {site.supportEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground">
          <span>{interpolate(dict.bleeq.footer.copyright, { year, name: site.name })}</span>
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
