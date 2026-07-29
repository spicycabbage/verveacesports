"use client";

import { createContext, useContext, type ReactNode } from "react";
import { SITES, type SiteConfig, type SiteId } from "@/lib/site/config";

const SiteContext = createContext<SiteConfig>(SITES.verveace);

export function SiteProvider({
  siteId,
  children,
}: {
  siteId: SiteId;
  children: ReactNode;
}) {
  return <SiteContext.Provider value={SITES[siteId]}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteConfig {
  return useContext(SiteContext);
}
