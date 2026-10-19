import { notFound } from "next/navigation";
import { getSite } from "@/lib/site/get-site";
import type { SiteConfig } from "@/lib/site/config";

export async function requireVoltSite(): Promise<SiteConfig> {
  const site = await getSite();
  if (site.id !== "volt-ca") notFound();
  return site;
}
