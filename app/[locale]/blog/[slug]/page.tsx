import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BlogArticle, blogArticleMetadata } from "@/components/blog/BlogArticle";
import { getBlogPost } from "@/lib/content/blog";
import { getLocalizedPost } from "@/lib/content/blog/localize";
import { blogPath, isBlogPrefixLocale } from "@/lib/content/blog/paths";
import { requireVerveaceSite } from "@/lib/site/require-verveace";

type Params = Promise<{ locale: string; slug: string }>;

/**
 * English-only posts (no translation yet) send readers to that language's blog
 * index instead of a 404, e.g. after switching language on an English article.
 * These URLs are never linked, listed in the sitemap, or used as hreflang.
 */
function resolve(locale: string, slug: string) {
  if (!isBlogPrefixLocale(locale)) notFound();
  if (getLocalizedPost(slug, locale)) return locale;
  if (getBlogPost(slug)) redirect(blogPath(locale));
  notFound();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ locale, slug }, site] = await Promise.all([params, requireVerveaceSite()]);
  return blogArticleMetadata(site, resolve(locale, slug), slug);
}

export default async function LocalizedBlogPostPage({ params }: { params: Params }) {
  const [{ locale, slug }, site] = await Promise.all([params, requireVerveaceSite()]);
  return <BlogArticle site={site} locale={resolve(locale, slug)} slug={slug} />;
}
