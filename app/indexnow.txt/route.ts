import { getSite } from "@/lib/site/get-site";
import { indexNowKey } from "@/lib/site/indexnow";

export async function GET() {
  const site = await getSite();
  const key = indexNowKey();
  if (!key || site.id !== "verveace") {
    return new Response("Not found", { status: 404 });
  }
  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
