import { renderBlogRss } from "@/lib/content/blog/rss";
import { getSite } from "@/lib/site/get-site";

export async function GET() {
  const site = await getSite();
  if (site.id !== "verveace") return new Response("Not found", { status: 404 });
  return new Response(renderBlogRss(site, "en"), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Content-Language": "en-CA",
    },
  });
}
