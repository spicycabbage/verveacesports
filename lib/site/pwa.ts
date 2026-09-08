import type { MetadataRoute } from "next";
import type { SiteConfig, SiteId } from "./config";
import { siteBaseUrl } from "./seo";

export type SitePwaChrome = {
  themeColor: string;
  backgroundColor: string;
};

export function sitePwaChrome(siteId: SiteId): SitePwaChrome {
  switch (siteId) {
    case "bleeq-ca":
      return { themeColor: "#0a0a0a", backgroundColor: "#0a0a0a" };
    case "verveace":
      return { themeColor: "#193d63", backgroundColor: "#193d63" };
    default: {
      const _exhaustive: never = siteId;
      return _exhaustive;
    }
  }
}

function pwaIcons(maskable: boolean): NonNullable<MetadataRoute.Manifest["icons"]> {
  const suffix = maskable ? "?maskable=1" : "";
  const purpose = maskable ? "maskable" : "any";
  return [
    {
      src: `/pwa-icon/192${suffix}`,
      sizes: "192x192",
      type: "image/png",
      purpose,
    },
    {
      src: `/pwa-icon/512${suffix}`,
      sizes: "512x512",
      type: "image/png",
      purpose,
    },
  ];
}

export function siteWebManifest(site: SiteConfig): MetadataRoute.Manifest {
  const chrome = sitePwaChrome(site.id);
  const shortcutIcon = {
    src: "/pwa-icon/192",
    sizes: "192x192",
    type: "image/png",
    purpose: "any" as const,
  };

  return {
    id: siteBaseUrl(site),
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "any",
    lang: "en-CA",
    dir: "ltr",
    background_color: chrome.backgroundColor,
    theme_color: chrome.themeColor,
    categories: ["shopping"],
    icons: [
      {
        src: "/pwa-icon/180",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      ...pwaIcons(false),
      ...pwaIcons(true),
    ],
    shortcuts: [
      {
        name: "Shop",
        short_name: "Shop",
        url: "/products",
        icons: [shortcutIcon],
      },
      {
        name: "Cart",
        short_name: "Cart",
        url: "/cart",
        icons: [shortcutIcon],
      },
    ],
  };
}
