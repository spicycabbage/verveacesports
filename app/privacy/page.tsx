import { cookies } from "next/headers";
import { LegalPage } from "@/components/legal/LegalPage";
import { getSite } from "@/lib/site/get-site";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";

export async function generateMetadata() {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const priv = dict.legal.privacy;
  return {
    title: priv.title,
    description: interpolate(priv.metaDesc, { name: site.name }),
    alternates: { canonical: "/privacy" },
  };
}

export default async function PrivacyPage() {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const host = site.hosts[0] ?? "verveacesports.com";
  const priv = dict.legal.privacy;
  const vars = { name: site.name, host, supportEmail: site.supportEmail };

  return (
    <LegalPage
      title={priv.title}
      updated={priv.updated}
      intro={interpolate(priv.intro, vars)}
      supportEmail={site.supportEmail}
      sections={priv.sections.map((s) => ({
        title: s.title,
        body: s.body.map((b) => interpolate(b, vars)),
      }))}
    />
  );
}
