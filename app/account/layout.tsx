import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Sparkles, Package, Gift, User, LayoutDashboard } from "lucide-react";
import { SignOutButton } from "./SignOutButton";

const NAV = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/loyalty", label: "Loyalty", icon: Sparkles },
  { href: "/account/referrals", label: "Referrals", icon: Gift },
] as const;

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single<{ is_admin: boolean }>();

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h2>
          <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1 md:mx-0 md:flex-col md:overflow-visible [-webkit-overflow-scrolling:touch]">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent md:shrink md:whitespace-normal md:py-2"
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
            {profile?.is_admin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
              >
                <LayoutDashboard className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>
        </div>
        <SignOutButton />
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
