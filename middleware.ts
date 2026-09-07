import { NextResponse, type NextRequest } from "next/server";
import { proxy, config as proxyConfig } from "@/proxy";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");

  // Permanent redirect www.verveacesports.com → https://verveacesports.com
  if (host === "www.verveacesports.com") {
    const url = request.nextUrl.clone();
    url.host = "verveacesports.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, { status: 308 });
  }

  return proxy(request);
}

export const config = proxyConfig;
