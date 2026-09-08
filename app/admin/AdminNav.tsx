"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  CreditCard,
  LineChart,
  LogOut,
} from "lucide-react";
import { SIGN_OUT_PATH } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/pos", label: "POS", icon: CreditCard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/finance", label: "Finance", icon: BarChart3 },
  { href: "/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/chat", label: "Chat", icon: MessageCircle },
  { href: "/admin/warranty", label: "Warranty", icon: Shield },
  { href: "/admin/discounts", label: "Coupons", icon: Ticket },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="min-w-0 space-y-1 print:hidden">
      <h2 className="mb-2 hidden px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:block">
        Admin
      </h2>
      <nav className="-mx-1 flex min-w-0 gap-1 overflow-x-auto pb-1 md:mx-0 md:flex-col md:overflow-visible md:pb-0 [-webkit-overflow-scrolling:touch]">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent md:shrink md:whitespace-normal md:py-2",
              isActive(pathname, item.href) && "bg-accent",
            )}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </Link>
        ))}
        {/* Plain <a>: next/link would prefetch GET /api/auth/sign-out. */}
        <a
          href={SIGN_OUT_PATH}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground md:mt-2 md:border-t md:pt-3 md:py-2"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </a>
      </nav>
    </aside>
  );
}
