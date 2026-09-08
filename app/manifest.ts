import type { MetadataRoute } from "next";
import { getSite } from "@/lib/site/get-site";
import { siteWebManifest } from "@/lib/site/pwa";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSite();
  return siteWebManifest(site);
}
