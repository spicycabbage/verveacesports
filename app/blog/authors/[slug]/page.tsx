import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogAuthor, blogAuthorMetadata } from "@/components/blog/BlogAuthor";
import { getBlogAuthor } from "@/lib/content/blog";
import { requireVerveaceSite } from "@/lib/site/require-verveace";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const [{ slug }, site] = await Promise.all([params, requireVerveaceSite()]);
  if (!getBlogAuthor(slug)) notFound();
  return blogAuthorMetadata(site, "en", slug);
}

export default async function BlogAuthorPage({ params }: { params: Params }) {
  const [{ slug }, site] = await Promise.all([params, requireVerveaceSite()]);
  return <BlogAuthor site={site} locale="en" slug={slug} />;
}
