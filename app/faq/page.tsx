import Link from "next/link";
import { cookies } from "next/headers";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { getSite } from "@/lib/site/get-site";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getDictionary, interpolate } from "@/lib/i18n/dictionary";
import { faqSectionsFromDict } from "@/lib/i18n/helpers";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata() {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return {
    title: dict.faq.title,
    description: interpolate(
      site.id === "bleeq-ca" ? dict.faq.introBleeq : dict.faq.introVerveace,
      { email: site.supportEmail },
    ),
    alternates: { canonical: "/faq" },
  };
}

export default async function FaqPage() {
  const site = await getSite();
  const cookieStore = await cookies();
  const dict = getDictionary(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  const sections = faqSectionsFromDict(dict, site.id, {
    supportEmail: site.supportEmail,
    freeShippingOver: site.freeShippingOver,
  });
  const intro = interpolate(
    site.id === "bleeq-ca" ? dict.faq.introBleeq : dict.faq.introVerveace,
    { email: site.supportEmail },
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sections.flatMap((section) =>
      section.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    ),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <JsonLd data={faqJsonLd} />
      <p className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {dict.faq.home}
        </Link>
        {" / "}
        {dict.faq.title}
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{dict.faq.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {intro.split(site.supportEmail).map((part, i, arr) =>
          i < arr.length - 1 ? (
            <span key={i}>
              {part}
              <a
                href={`mailto:${site.supportEmail}`}
                className="text-primary hover:underline"
              >
                {site.supportEmail}
              </a>
            </span>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>
      <div className="mt-8 sm:mt-10">
        <FaqAccordion sections={sections} />
      </div>
    </div>
  );
}
