import { renderBlogRss } from "@/lib/content/blog/rss";
import { blogHrefLang, isBlogPrefixLocale } from "@/lib/content/blog/paths";
import { blogLocalesFor } from "@/lib/content/blog/translations";
import { getSite } from "@/lib/site/get-site";

type Params = Promise<{ locale: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { locale } = await params;
  const site = await getSite();
  if (site.id !== "verveace" || !isBlogPrefixLocale(locale) || !blogLocalesFor().includes(locale)) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(renderBlogRss(site, locale), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Content-Language": blogHrefLang(locale),
    },
  });
}
