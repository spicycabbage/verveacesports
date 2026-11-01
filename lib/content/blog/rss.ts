import type { Locale } from "@/lib/i18n/locale";
import type { SiteConfig } from "@/lib/site/config";
import { siteAbsoluteUrl } from "@/lib/site/seo";
import { blogDateIso, publishedBlogPosts } from "./index";
import { localizePost } from "./localize";
import { blogHrefLang, blogPath, blogPostPath } from "./paths";
import { blogUi } from "./ui";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderBlogRss(site: SiteConfig, locale: Locale): string {
  const ui = blogUi(locale);
  const live = publishedBlogPosts();
  const posts = live.flatMap((post) => {
    const localized = localizePost(post, locale);
    return localized ? [localized] : [];
  });
  const blogUrl = siteAbsoluteUrl(site, blogPath(locale));
  const items = posts
    .map((post) => {
      const url = siteAbsoluteUrl(site, blogPostPath(locale, post.slug));
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(blogDateIso(post.publishedAt)).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(post.author.name)}</dc:creator>
      <category>${escapeXml(post.categoryLabel)}</category>
      <description>${escapeXml(post.description)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${site.name} ${ui.blog}`)}</title>
    <link>${blogUrl}</link>
    <atom:link href="${siteAbsoluteUrl(site, blogPath(locale, "/rss.xml"))}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(ui.indexDescription)}</description>
    <language>${blogHrefLang(locale)}</language>
    <lastBuildDate>${new Date(blogDateIso(posts[0]?.publishedAt ?? live[0].publishedAt)).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
