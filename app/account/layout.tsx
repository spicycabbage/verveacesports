import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));

  const NAV = [
    { href: "/account", label: dict.account.profile },
    { href: "/account/orders", label: dict.account.orders },
    { href: "/account/loyalty", label: dict.account.loyalty },
    { href: "/account/referrals", label: dict.account.referrals },
  ] as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single<{ is_admin: boolean }>();

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:px-2">
            {dict.account.title}
          </h2>
          <nav className="flex w-full items-stretch gap-0.5 md:flex-col md:gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-w-0 flex-1 rounded-md px-1 py-2 text-center text-xs font-medium hover:bg-accent sm:text-sm md:flex-none md:px-3 md:text-left md:text-sm"
              >
                {item.label}
              </Link>
            ))}
            {profile?.is_admin && (
              <Link
                href="/admin"
                className="min-w-0 flex-1 rounded-md px-1 py-2 text-center text-xs font-medium text-primary hover:bg-accent sm:text-sm md:flex-none md:px-3 md:text-left md:text-sm"
              >
                {dict.account.admin}
              </Link>
            )}
          </nav>
        </div>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
