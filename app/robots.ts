import type { MetadataRoute } from "next";
import {
  LLM_ROBOTS_AGENTS,
  ROBOTS_DISALLOW,
  SCRAPER_ROBOTS_AGENTS,
} from "@/lib/bots/crawlers";
import { getSite } from "@/lib/site/get-site";
import { siteBaseUrl } from "@/lib/site/seo";

const publicRules: { allow: string; disallow: string[] } = {
  allow: "/",
  disallow: [...ROBOTS_DISALLOW],
};

// Uses request headers (host) so each storefront domain serves its own robots.txt.
// A named user-agent group does not inherit `*`, so LLM agents repeat the private paths.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite();
  const base = siteBaseUrl(site);
  return {
    rules: [
      {
        userAgent: [...LLM_ROBOTS_AGENTS],
        ...publicRules,
      },
      {
        userAgent: [...SCRAPER_ROBOTS_AGENTS],
        disallow: "/",
      },
      {
        userAgent: "*",
        ...publicRules,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
