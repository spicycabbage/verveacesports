import { headers } from "next/headers";
import { SITES, resolveSiteId, type SiteConfig, type SiteId } from "./config";

/** Resolve the active storefront for the current request. */
export async function getSite(): Promise<SiteConfig> {
  const h = await headers();
  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    h.get("host") ||
    null;
  const id = resolveSiteId({
    hostname: host,
    envSiteId: process.env.SITE_ID,
  });
  return SITES[id];
}

export function getSiteById(id: SiteId): SiteConfig {
  return SITES[id];
}

/** Sync helper for edge/proxy where headers() is unavailable. */
export function getSiteFromRequest(request: {
  headers: { get(name: string): string | null };
}): SiteConfig {
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    null;
  const id = resolveSiteId({
    hostname: host,
    envSiteId: process.env.SITE_ID,
  });
  return SITES[id];
}
