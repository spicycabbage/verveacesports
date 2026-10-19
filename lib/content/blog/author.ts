import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import type { SiteConfig } from "@/lib/site/config";
import { siteAbsoluteUrl, siteBaseUrl } from "@/lib/site/seo";
import { blogUi } from "./ui";
import { blogAuthorPath as authorPath } from "./paths";

export type BlogAuthor = {
  slug: string;
  name: string;
  shortBio: string;
  bio: string[];
  knowsAbout: string[];
};

export const KIM_CHEN: BlogAuthor = {
  slug: "kim-chen",
  name: "Kim Chen",
  shortBio:
    "Kim Chen is an avid tech enthusiast, golfer, and cyclist who tests the gear we sell on real courses and real rides.",
  bio: [
    "Kim Chen is an avid tech enthusiast, golfer, and cyclist, and writes the VerveaceSports guides.",
    "Most of Kim's weekends are split between walking 18 holes and logging kilometres on the bike, which is exactly where electric golf carts and AI sports glasses earn their keep. Kim's guides focus on what actually matters once the gear is in use: battery life, how a cart handles a steep back nine, and whether camera glasses capture the ride the way you saw it.",
  ],
  knowsAbout: [
    "Electric golf push carts",
    "Golf",
    "Cycling",
    "AI sports glasses",
    "Camera glasses",
    "Consumer technology",
  ],
};

export const BLOG_AUTHORS: readonly BlogAuthor[] = [KIM_CHEN];

export function getBlogAuthor(slug: string): BlogAuthor | null {
  return BLOG_AUTHORS.find((a) => a.slug === slug) ?? null;
}

export function blogAuthorPath(author: BlogAuthor, locale: Locale = DEFAULT_LOCALE): string {
  return authorPath(locale, author.slug);
}

export function blogAuthorJsonLd(author: BlogAuthor, site: SiteConfig, locale: Locale = DEFAULT_LOCALE) {
  const ui = blogUi(locale);
  const url = siteAbsoluteUrl(site, blogAuthorPath(author, locale));
  return {
    "@type": "Person",
    "@id": `${siteAbsoluteUrl(site, blogAuthorPath(author, DEFAULT_LOCALE))}#person`,
    name: author.name,
    url,
    description: ui.authorShortBio,
    knowsAbout: ui.knowsAbout,
    worksFor: { "@type": "Organization", name: site.name, url: siteBaseUrl(site) },
  };
}
