import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle, blogArticleMetadata } from "@/components/blog/BlogArticle";
import { getLocalizedPost } from "@/lib/content/blog/localize";
import { isBlogPrefixLocale } from "@/lib/content/blog/paths";
import { requireVerveaceSite } from "@/lib/site/require-verveace";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ locale, slug }, site] = await Promise.all([params, requireVerveaceSite()]);
  if (!isBlogPrefixLocale(locale)) notFound();
  if (!getLocalizedPost(slug, locale)) notFound();
  return blogArticleMetadata(site, locale, slug);
}

export default async function LocalizedBlogPostPage({ params }: { params: Params }) {
  const [{ locale, slug }, site] = await Promise.all([params, requireVerveaceSite()]);
  if (!isBlogPrefixLocale(locale)) notFound();
  return <BlogArticle site={site} locale={locale} slug={slug} />;
}
