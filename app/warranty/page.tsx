import { cookies } from "next/headers";
import { WarrantyTabs } from "@/components/warranty/WarrantyTabs";
import { getWarrantyPolicy, warrantyProductOptions } from "@/lib/content/warranty";
import { getSite } from "@/lib/site/get-site";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";

export async function generateMetadata() {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return {
    title: dict.legal.warranty.title,
    description: interpolate(dict.legal.warranty.metaDesc, { name: site.name }),
    alternates: { canonical: "/warranty" },
  };
}

export default async function WarrantyPage() {
  const site = await getSite();
  const policy = getWarrantyPolicy(site);
  const products = warrantyProductOptions(site);

  return (
    <WarrantyTabs policy={policy} products={products} supportEmail={site.supportEmail} />
  );
}
