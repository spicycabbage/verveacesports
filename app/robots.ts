import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site/get-site";
import { siteBaseUrl } from "@/lib/site/seo";

// Uses request headers (host) so each storefront domain serves its own robots.txt.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite();
  const base = siteBaseUrl(site);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/api/",
        "/cart",
        "/checkout",
        "/login",
        "/signup",
        "/callback",
        "/theme",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
