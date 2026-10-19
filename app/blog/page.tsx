import type { Metadata } from "next";
import { BlogIndex, blogIndexMetadata } from "@/components/blog/BlogIndex";
import { requireVerveaceSite } from "@/lib/site/require-verveace";

export async function generateMetadata(): Promise<Metadata> {
  const site = await requireVerveaceSite();
  return blogIndexMetadata(site, "en");
}

export default async function BlogIndexPage() {
  const site = await requireVerveaceSite();
  return <BlogIndex site={site} locale="en" />;
}
