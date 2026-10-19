import { getSite } from "@/lib/site/get-site";
import { buildLlmsTxt } from "@/lib/site/llms-txt";

export async function GET() {
  const site = await getSite();
  return new Response(buildLlmsTxt(site), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
