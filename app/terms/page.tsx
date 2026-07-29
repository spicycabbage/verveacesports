import { cookies } from "next/headers";
import { LegalPage } from "@/components/legal/LegalPage";
import { getSite } from "@/lib/site/get-site";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";

export async function generateMetadata() {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const terms = dict.legal.terms;
  return {
    title: terms.title,
    description: interpolate(terms.metaDesc, { name: site.name }),
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsPage() {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const host = site.hosts[0] ?? "verveacesports.com";
  const terms = dict.legal.terms;
  const isBleeq = site.id === "bleeq-ca";
  const vars = {
    name: site.name,
    host,
    supportEmail: site.supportEmail,
    freeShippingOver: String(site.freeShippingOver),
  };

  // Site-conditional paragraph overrides, keyed by section index → body index.
  // Section order matches dict.legal.terms.sections: 1 = Products & pricing,
  // 3 = Shipping & returns, 7 = Governing law.
  const overrides: Record<number, Record<number, string>> = isBleeq
    ? {
        1: { 0: terms.productsPricingBleeq },
        3: { 0: terms.shippingBodyBleeq },
        7: { 0: terms.governingLawBleeq },
      }
    : {
        1: { 0: terms.productsPricingVerveace },
        3: { 0: terms.shippingBodyVerveace },
        7: { 0: terms.governingLawVerveace },
      };

  const sections = terms.sections.map((s, si) => ({
    title: s.title,
    body: s.body.map((b, bi) => interpolate(overrides[si]?.[bi] ?? b, vars)),
  }));

  return (
    <LegalPage
      title={terms.title}
      updated={terms.updated}
      intro={interpolate(terms.intro, vars)}
      supportEmail={site.supportEmail}
      sections={sections}
    />
  );
}
