import { CATEGORIES, type Category, type CountryCode } from "@/lib/constants";

export const SITE_COOKIE = "verveacesports_site";

export type SiteId = "verveace" | "bleeq-ca" | "volt-ca";

export type NavProductLink = {
  slug: string;
  label: string;
  shortLabel: string;
  image: string;
};

export type SiteConfig = {
  id: SiteId;
  hosts: readonly string[];
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  supportEmail: string;
  /** Cart subtotal (order currency) at or above this gets free standard shipping. */
  freeShippingOver: number;
  categories: readonly Category[];
  lockMarket: CountryCode | null;
  storagePrefix: string;
  cartStorageKey: string;
  themeStorageKey: string;
  newsletterSubscribedKey: string;
  newsletterDismissedKey: string;
  rangerProducts: readonly NavProductLink[];
  accessoryProducts: readonly NavProductLink[];
  /**
   * Storefront catalog brand. Null sells every brand in `categories`.
   * A set brand only sells products whose slug starts with `${brand}-`
   * (or whose `products.brand` matches).
   */
  brand: string | null;
};

function catalogNav(slug: string): string {
  return `/catalog/nav/${slug}.webp`;
}

const ROVER_LINEUP: readonly NavProductLink[] = [
  {
    slug: "bleequp-rover-ai-sports-glasses",
    label: "Rover — ZEISS",
    shortLabel: "Rover ZEISS",
    image: catalogNav("bleequp-rover-ai-sports-glasses"),
  },
  {
    slug: "bleequp-rover-ai-sports-glasses-bundle",
    label: "Rover — Bundle",
    shortLabel: "Rover Bundle",
    image: catalogNav("bleequp-rover-ai-sports-glasses-bundle"),
  },
];

const RANGER_LINEUP: readonly NavProductLink[] = [
  {
    slug: "bleequp-ranger-standard-lens",
    label: "Ranger — Standard Lens",
    shortLabel: "Standard Lens",
    image: catalogNav("bleequp-ranger-standard-lens"),
  },
  {
    slug: "bleequp-ranger-zeiss-lens",
    label: "Ranger — Lenses by Zeiss",
    shortLabel: "Zeiss Lens",
    image: catalogNav("bleequp-ranger-zeiss-lens"),
  },
  {
    slug: "bleequp-ranger-ultimate-bundle",
    label: "Ranger — Ultimate Bundle",
    shortLabel: "Ultimate Bundle",
    image: catalogNav("bleequp-ranger-ultimate-bundle"),
  },
];

const ROVER_ACCESSORIES: readonly NavProductLink[] = [
  {
    slug: "bleequp-rover-power-plus",
    label: "Rover Power Plus",
    shortLabel: "Rover Power Plus",
    image: catalogNav("bleequp-rover-power-plus"),
  },
  {
    slug: "bleequp-rover-zeiss-lens",
    label: "Rover ZEISS Lens",
    shortLabel: "Rover ZEISS Lens",
    image: catalogNav("bleequp-rover-zeiss-lens"),
  },
  {
    slug: "bleequp-rover-photochromic-lens",
    label: "Rover Photochromic Lens",
    shortLabel: "Rover Photochromic",
    image: catalogNav("bleequp-rover-photochromic-lens"),
  },
  {
    slug: "bleequp-rover-polarized-lens",
    label: "Rover Polarized Lens",
    shortLabel: "Rover Polarized",
    image: catalogNav("bleequp-rover-polarized-lens"),
  },
];

export const SITES: Record<SiteId, SiteConfig> = {
  verveace: {
    id: "verveace",
    hosts: [
      "verveacesports.com",
      "www.verveacesports.com",
      "localhost",
      "127.0.0.1",
    ],
    name: "VerveaceSports",
    shortName: "VerveAce",
    tagline: "Premium Sporting Goods",
    description:
      "Authorized retailer for BleeqUp AI sports camera glasses, Volt Caddy remote electric golf push carts, and MGI & Motocaddy electric golf trolleys, caddies, and gear.",
    supportEmail: "info@verveacesports.com",
    freeShippingOver: 500,
    categories: CATEGORIES,
    lockMarket: null,
    storagePrefix: "verveacesports",
    cartStorageKey: "verveacesports_cart_v2",
    themeStorageKey: "verveacesports_theme_v8",
    newsletterSubscribedKey: "verveacesports_newsletter_subscribed_v1",
    // Bumped to v3 so the closeable expo popup re-shows after the mobile close-button fix.
    newsletterDismissedKey: "verveacesports_newsletter_dismissed_v3",
    brand: null,
    rangerProducts: [...ROVER_LINEUP, ...RANGER_LINEUP],
    accessoryProducts: [
      ...ROVER_ACCESSORIES,
      {
        slug: "bleequp-power-plus",
        label: "Power Plus",
        shortLabel: "Power Plus",
        image: catalogNav("bleequp-power-plus"),
      },
      {
        slug: "bleequp-bluetooth-controller",
        label: "Bluetooth Controller",
        shortLabel: "Controller",
        image: "",
      },
      {
        slug: "bleequp-magnetic-charging-wire",
        label: "Magnetic Charging Wire",
        shortLabel: "Charging Wire",
        image: "",
      },
      {
        slug: "zeiss-blue-lens",
        label: "Swappable Lens",
        shortLabel: "Lens",
        image: "",
      },
      {
        slug: "bleequp-prescription-service",
        label: "Prescription",
        shortLabel: "Prescription",
        image: "",
      },
    ],
  },
  "bleeq-ca": {
    id: "bleeq-ca",
    // CA storefront on BleeqUp's subdomain — add extras via BLEEQ_CA_HOSTS if needed.
    hosts: ["ca.bleequp.com"],
    name: "BleeqUp Canada",
    shortName: "BleeqUp",
    tagline: "Rover AI Sports Glasses",
    description:
      "Buy BleeqUp Rover AI sports glasses in Canada. Official authorized retailer — CAD pricing and free 30-day returns.",
    supportEmail: "info@verveacesports.com",
    freeShippingOver: 500,
    categories: ["ai-glasses", "wearables"],
    lockMarket: "CA",
    storagePrefix: "bleeq_ca",
    cartStorageKey: "bleeq_ca_cart_v1",
    themeStorageKey: "bleeq_ca_theme_v1",
    newsletterSubscribedKey: "bleeq_ca_newsletter_subscribed_v1",
    // Bumped to v3 so the closeable expo popup re-shows after the mobile close-button fix.
    newsletterDismissedKey: "bleeq_ca_newsletter_dismissed_v3",
    brand: null,
    rangerProducts: [...ROVER_LINEUP, ...RANGER_LINEUP],
    accessoryProducts: [
      ...ROVER_ACCESSORIES,
      {
        slug: "bleequp-power-plus",
        label: "Power Plus",
        shortLabel: "Power Plus",
        image: catalogNav("bleequp-power-plus"),
      },
      {
        slug: "bleequp-bluetooth-controller",
        label: "Bluetooth Controller",
        shortLabel: "Controller",
        image: "",
      },
      {
        slug: "bleequp-magnetic-charging-wire",
        label: "Magnetic Charging Wire",
        shortLabel: "Charging Wire",
        image: "",
      },
      {
        slug: "zeiss-blue-lens",
        label: "Swappable Lens",
        shortLabel: "Lens",
        image: "",
      },
      {
        slug: "bleequp-prescription-service",
        label: "Prescription",
        shortLabel: "Prescription",
        image: "",
      },
    ],
  },
  "volt-ca": {
    id: "volt-ca",
    hosts: ["voltcaddy.ca", "www.voltcaddy.ca"],
    name: "Volt Caddy",
    shortName: "Volt",
    tagline: "Electric Remote Golf Push Cart",
    description:
      "Buy the Volt Caddy Pro-S remote electric golf push cart in Canada. CAD pricing and free 30-day returns.",
    supportEmail: "info@voltcaddy.com",
    freeShippingOver: 500,
    categories: ["electric-carts"],
    lockMarket: "CA",
    storagePrefix: "volt_ca",
    cartStorageKey: "volt_ca_cart_v1",
    themeStorageKey: "volt_ca_theme_v1",
    newsletterSubscribedKey: "volt_ca_newsletter_subscribed_v1",
    newsletterDismissedKey: "volt_ca_newsletter_dismissed_v1",
    brand: "volt-caddy",
    rangerProducts: [
      {
        slug: "volt-caddy-pro-s",
        label: "Pro-S Remote Pushcart",
        shortLabel: "Pro-S",
        image: "/catalog/volt/pro-s-01-sq.webp",
      },
    ],
    accessoryProducts: [],
  },
} as const;

function hostsFromEnv(envValue: string | undefined): string[] {
  if (!envValue?.trim()) return [];
  return envValue
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

/** Extra Bleeq CA hosts from Vercel env (comma-separated), e.g. `canada.bleequp.com`. */
export function bleeqCaHosts(): string[] {
  const configured = [...SITES["bleeq-ca"].hosts];
  for (const h of hostsFromEnv(process.env.BLEEQ_CA_HOSTS)) {
    if (!configured.includes(h)) configured.push(h);
  }
  return configured;
}

/** Extra Volt Caddy hosts from Vercel env (comma-separated). */
export function voltCaHosts(): string[] {
  const configured = [...SITES["volt-ca"].hosts];
  for (const h of hostsFromEnv(process.env.VOLT_CA_HOSTS)) {
    if (!configured.includes(h)) configured.push(h);
  }
  return configured;
}

/** Admin property column / filters — not customer-facing storefront name. */
export function adminPropertyLabel(siteId: SiteId): string {
  switch (siteId) {
    case "verveace":
      return SITES.verveace.name;
    case "bleeq-ca":
      return "BleeqUp";
    case "volt-ca":
      return "Volt Caddy";
    default: {
      const _exhaustive: never = siteId;
      return _exhaustive;
    }
  }
}

export function isSiteId(value: string | null | undefined): value is SiteId {
  return value === "verveace" || value === "bleeq-ca" || value === "volt-ca";
}

/** Admin list filters. `null` is the all-storefronts option. */
export function adminSiteFilters(): { id: SiteId | null; label: string }[] {
  return [
    { id: null, label: "All" },
    ...(Object.keys(SITES) as SiteId[]).map((id) => ({
      id,
      label: adminPropertyLabel(id),
    })),
  ];
}

export function siteAllowsProduct(
  site: SiteConfig,
  product: { category: string; slug: string; brand?: string | null },
): boolean {
  if (!siteAllowsCategory(site, product.category)) return false;
  if (!site.brand) return true;
  return product.brand === site.brand || product.slug.startsWith(`${site.brand}-`);
}

export function siteAllowsCategory(site: SiteConfig, category: string): boolean {
  return (site.categories as readonly string[]).includes(category);
}

function isLocalDevHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1";
}

function isVercelPreviewHost(host: string): boolean {
  return host.endsWith(".vercel.app");
}

export function resolveSiteIdFromHost(hostname: string): SiteId | null {
  const host = hostname.toLowerCase().split(":")[0] ?? hostname;

  if (bleeqCaHosts().includes(host)) return "bleeq-ca";
  if (voltCaHosts().includes(host)) return "volt-ca";

  for (const site of Object.values(SITES)) {
    if (site.id === "bleeq-ca" || site.id === "volt-ca") continue;
    if (site.hosts.includes(host)) return site.id;
  }
  return null;
}

/**
 * Host wins in production (one deploy → verveacesports.com + ca.bleequp.com + voltcaddy.ca).
 * SITE_ID overrides only for localhost / *.vercel.app so you can preview a
 * storefront before the domain is attached — do NOT set SITE_ID on Production.
 */
export function resolveSiteId(opts: {
  hostname?: string | null;
  envSiteId?: string | null;
}): SiteId {
  const env = opts.envSiteId?.trim().toLowerCase();
  const envSite: SiteId | null = isSiteId(env) ? env : null;

  const host = opts.hostname?.toLowerCase().split(":")[0] ?? null;

  if (host) {
    if (isLocalDevHost(host) || isVercelPreviewHost(host)) {
      if (envSite) return envSite;
    }

    const fromHost = resolveSiteIdFromHost(host);
    if (fromHost) return fromHost;
  }

  if (envSite) return envSite;
  return "verveace";
}
