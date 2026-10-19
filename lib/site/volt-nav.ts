/** Shared Volt Caddy storefront nav. Header, mobile menu, and footer all read this. */
export const VOLT_NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/technologies", label: "Technologies" },
  { href: "/manual", label: "User Manual" },
  { href: "/returns", label: "Returns & Refunds" },
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "Q&A" },
  { href: "/contact", label: "Contact" },
] as const;

export type VoltNavItem = (typeof VOLT_NAV)[number];

export function voltNavActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
