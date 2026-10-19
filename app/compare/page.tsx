import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { RoverCompareTable } from "@/components/product/rover/RoverCompareTable";
import { notFound } from "next/navigation";
import { getSite } from "@/lib/site/get-site";
import { siteAbsoluteUrl } from "@/lib/site/seo";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { roverCopy } from "@/lib/i18n/rover-copy";
import { ROVER_PRIMARY_SLUG } from "@/lib/content/bleequp-rover";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const copy = roverCopy(parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value));
  return {
    title: copy.compare.title,
    description: copy.compare.sub,
    alternates: { canonical: "/compare" },
    openGraph: {
      title: copy.compare.title,
      description: copy.compare.sub,
      url: "/compare",
    },
  };
}

export default async function ComparePage() {
  const [site, cookieStore] = await Promise.all([getSite(), cookies()]);
  if (site.id === "volt-ca") notFound();
  const locale = parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value);
  const copy = roverCopy(locale);
  const compareUrl = siteAbsoluteUrl(site, "/compare");

  let ships: string;
  switch (site.id) {
    case "bleeq-ca":
      ships = "This storefront ships within Canada only. Prices are CAD.";
      break;
    case "verveace":
      ships = "This storefront ships to Canada and the United States. Prices are CAD.";
      break;
    default: {
      const _exhaustive: never = site.id;
      return _exhaustive;
    }
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: copy.compare.title,
    url: compareUrl,
    description: copy.compare.sub,
    about: [
      { "@type": "Thing", name: "BleeqUp Rover" },
      { "@type": "Thing", name: "BleeqUp Ranger" },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <JsonLd data={pageJsonLd} />
      <JsonLd data={faqJsonLd} />

      <p className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {site.shortName}
        </Link>
        {" / "}
        {copy.compare.title}
      </p>

      <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-4xl">{copy.compare.title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {copy.compare.sub} Rover and Ranger are different BleeqUp models — not variants of one
        product. {ships} {site.name} is an authorized retailer, not bleequp.com.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Unused items in original packaging can be returned within 30 days of delivery. Return
        shipping fees may apply. See the{" "}
        <Link href="/faq" className="text-foreground underline-offset-4 hover:underline">
          FAQ
        </Link>{" "}
        for the full policy.
      </p>

      <RoverCompareTable copy={copy.compare} className="mt-8" />

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">{copy.specs.title}</h2>
        <dl className="mt-4 divide-y rounded-2xl border">
          {copy.specs.items.map((item) => (
            <div
              key={item.label}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4"
            >
              <dt className="text-sm font-medium">{item.label}</dt>
              <dd className="text-sm text-muted-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-muted-foreground">
          Rover specs above. Shop{" "}
          <Link
            href={`/products/${ROVER_PRIMARY_SLUG}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {copy.compare.shopRover}
          </Link>{" "}
          or{" "}
          <Link
            href="/products/bleequp-ranger-zeiss-lens"
            className="text-foreground underline-offset-4 hover:underline"
          >
            {copy.compare.shopRanger}
          </Link>
          .
        </p>
      </section>

      <div className="mt-12">
        <FaqAccordion
          sections={[
            {
              title: copy.faq.title,
              items: copy.faq.items.map((item) => ({
                question: item.q,
                answer: item.a,
              })),
            },
          ]}
        />
      </div>
    </div>
  );
}
