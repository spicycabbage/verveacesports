import Link from "next/link";
import { cookies } from "next/headers";
import { buttonVariants } from "@/components/ui/button";
import { getSite } from "@/lib/site/get-site";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";

export const metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default async function OfflinePage() {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {site.shortName}
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{dict.common.offlineTitle}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {interpolate(dict.common.offlineBody, { name: site.name })}
      </p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        {dict.common.tryAgain}
      </Link>
    </div>
  );
}
