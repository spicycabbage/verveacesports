import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { CartView } from "./CartView";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return { title: dict.nav.cart, robots: { index: false, follow: false } };
}

export default async function CartPage() {
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">{dict.cart.title}</h1>
      <CartView />
    </div>
  );
}
