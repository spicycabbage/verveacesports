import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site/get-site";
import { siteBaseUrl } from "@/lib/site/seo";
import { listSitemapProducts } from "@/lib/catalog/queries";
import { BLOG_AUTHORS, BLOG_POSTS, blogDateIso } from "@/lib/content/blog";
import { blogHreflangLanguages, blogPath } from "@/lib/content/blog/paths";
import { blogLocalesFor } from "@/lib/content/blog/translations";

// Uses request headers (host) so each storefront domain serves its own sitemap.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const base = siteBaseUrl(site);
  const products = await listSitemapProducts(site.id);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    ...site.categories.map((category) => ({
      url: `${base}/products?category=${category}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...(site.id === "volt-ca"
      ? [
          { url: `${base}/technologies`, changeFrequency: "monthly" as const, priority: 0.6 },
          { url: `${base}/manual`, changeFrequency: "monthly" as const, priority: 0.6 },
          { url: `${base}/returns`, changeFrequency: "yearly" as const, priority: 0.4 },
          { url: `${base}/about`, changeFrequency: "yearly" as const, priority: 0.4 },
          { url: `${base}/contact`, changeFrequency: "yearly" as const, priority: 0.4 },
        ]
      : [{ url: `${base}/compare`, changeFrequency: "monthly" as const, priority: 0.7 }]),
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/warranty`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    ...(site.id === "bleeq-ca"
      ? [{ url: `${base}/draw`, changeFrequency: "weekly" as const, priority: 0.6 }]
      : []),
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.created_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogLocales = blogLocalesFor();
  const blogEntries: MetadataRoute.Sitemap =
    site.id === "verveace"
      ? [
          ...blogLocales.map((locale) => ({
            url: `${base}${blogPath(locale)}`,
            lastModified: blogDateIso(BLOG_POSTS[0].publishedAt),
            changeFrequency: "weekly" as const,
            priority: 0.7,
            alternates: { languages: blogHreflangLanguages(site, "", blogLocales) },
          })),
          ...blogLocales.flatMap((locale) =>
            BLOG_POSTS.map((post) => ({
              url: `${base}${blogPath(locale, `/${post.slug}`)}`,
              lastModified: blogDateIso(post.updatedAt ?? post.publishedAt),
              changeFrequency: "monthly" as const,
              priority: 0.6,
              images: [`${base}${post.image.src}`],
              alternates: {
                languages: blogHreflangLanguages(site, `/${post.slug}`, blogLocales),
              },
            })),
          ),
          ...blogLocales.flatMap((locale) =>
            BLOG_AUTHORS.map((author) => ({
              url: `${base}${blogPath(locale, `/authors/${author.slug}`)}`,
              changeFrequency: "monthly" as const,
              priority: 0.3,
              alternates: {
                languages: blogHreflangLanguages(site, `/authors/${author.slug}`, blogLocales),
              },
            })),
          ),
        ]
      : [];

  return [...staticEntries, ...productEntries, ...blogEntries];
}
