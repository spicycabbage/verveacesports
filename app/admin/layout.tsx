import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Ticket,
  Truck,
  BarChart3,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";

export const metadata = {
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/finance", label: "Finance", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/chat", label: "Chat", icon: MessageCircle },
  { href: "/admin/warranty", label: "Warranty", icon: Shield },
  { href: "/admin/discounts", label: "Coupons", icon: Ticket },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single<{ is_admin: boolean }>();
  if (!profile?.is_admin) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[200px_1fr]">
      <aside className="min-w-0 space-y-1">
        <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin
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
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
