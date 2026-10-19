import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle, blogArticleMetadata } from "@/components/blog/BlogArticle";
import { getLocalizedPost } from "@/lib/content/blog/localize";
import { requireVerveaceSite } from "@/lib/site/require-verveace";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ slug }, site] = await Promise.all([params, requireVerveaceSite()]);
  if (!getLocalizedPost(slug, "en")) notFound();
  return blogArticleMetadata(site, "en", slug);
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const [{ slug }, site] = await Promise.all([params, requireVerveaceSite()]);
  return <BlogArticle site={site} locale="en" slug={slug} />;
}
