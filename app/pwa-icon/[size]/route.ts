import { brandLogoIconResponse } from "@/lib/site/logo-icon";
import { getSite } from "@/lib/site/get-site";

const SIZES = new Set([180, 192, 512]);

type Params = Promise<{ size: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  const { size: raw } = await params;
  const size = Number(raw);
  if (!SIZES.has(size)) {
    return new Response("Not found", { status: 404 });
  }

  const site = await getSite();
  const maskable = new URL(request.url).searchParams.get("maskable") === "1";
  return brandLogoIconResponse(site.id, size, { maskable });
}
