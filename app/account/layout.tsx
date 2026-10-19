import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionProfile, getSessionUser } from "@/lib/auth/session";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { AccountNav } from "./AccountNav";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const profile = await getSessionProfile();
  if (profile?.is_admin) redirect("/admin");

  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));

  const NAV = [
    { href: "/account", label: dict.account.profile },
    { href: "/account/orders", label: dict.account.orders },
    { href: "/account/loyalty", label: dict.account.loyalty },
    { href: "/account/referrals", label: dict.account.referrals },
    { href: "/account/settings", label: dict.account.settings },
  ] as const;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:px-2">
            {dict.account.title}
          </h2>
          <AccountNav items={NAV} liveAgentLabel={dict.nav.liveAgent} />
        </div>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
