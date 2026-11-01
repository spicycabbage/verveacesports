import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site/get-site";
import { siteBaseUrl } from "@/lib/site/seo";
import { listSitemapProducts } from "@/lib/catalog/queries";
import { BLOG_AUTHORS, BLOG_POSTS, blogDateIso } from "@/lib/content/blog";
import { blogHreflangLanguages, blogPath } from "@/lib/content/blog/paths";
import { blogLocalesFor, blogLocalesForPost } from "@/lib/content/blog/translations";
import { BLOG_CATEGORIES, blogCategoryPath } from "@/lib/content/blog/categories";

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
          ...BLOG_CATEGORIES.flatMap((category) => {
            const latest = BLOG_POSTS.find((post) => post.category === category.category);
            if (!latest) return [];
            return [
              {
                url: `${base}${blogCategoryPath(category.slug)}`,
                lastModified: blogDateIso(latest.updatedAt ?? latest.publishedAt),
                changeFrequency: "weekly" as const,
                priority: 0.6,
              },
            ];
          }),
          // Only languages a post is actually translated into.
          ...BLOG_POSTS.flatMap((post) => {
            const postLocales = blogLocalesForPost(post.slug);
            return postLocales.map((locale) => ({
              url: `${base}${blogPath(locale, `/${post.slug}`)}`,
              lastModified: blogDateIso(post.updatedAt ?? post.publishedAt),
              changeFrequency: "monthly" as const,
              priority: 0.6,
              images: [`${base}${post.image.src}`],
              alternates: {
                languages: blogHreflangLanguages(site, `/${post.slug}`, postLocales),
              },
            }));
          }),
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
