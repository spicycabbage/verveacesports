import { CATEGORIES, type Category, type CountryCode } from "@/lib/constants";

export const SITE_COOKIE = "verveacesports_site";

export type SiteId = "verveace" | "bleeq-ca";

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
};

const RANGER_IMG =
  "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Black_Standard_Lens.jpg?v=1781082522";
const ZEISS_IMG =
  "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Black_Standard_Lens.jpg?v=1781082522";
const BUNDLE_IMG =
  "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/BleeqUp_Ranger_Black_Standard_Lens.jpg?v=1781082522";
const ROVER_IMG =
  "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/4feb7c0139c4d61e49e5d93a29c4093d.png?v=1788523792";
const ROVER_BUNDLE_IMG =
  "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-bundle-kit-black-gold-zeiss.png?v=1788522779";
const ROVER_LENS_IMG =
  "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-lens-zeiss.webp?v=1788538089";
const ROVER_POWER_IMG =
  "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-power-plus.png?v=1788509881";

const ROVER_LINEUP: readonly NavProductLink[] = [
  {
    slug: "bleequp-rover-ai-sports-glasses",
    label: "Rover — ZEISS",
    shortLabel: "Rover ZEISS",
    image: ROVER_IMG,
  },
  {
    slug: "bleequp-rover-ai-sports-glasses-bundle",
    label: "Rover — Bundle",
    shortLabel: "Rover Bundle",
    image: ROVER_BUNDLE_IMG,
  },
];

const RANGER_LINEUP: readonly NavProductLink[] = [
  {
    slug: "bleequp-ranger-standard-lens",
    label: "Ranger — Standard Lens",
    shortLabel: "Standard Lens",
    image: RANGER_IMG,
  },
  {
    slug: "bleequp-ranger-zeiss-lens",
    label: "Ranger — Lenses by Zeiss",
    shortLabel: "Zeiss Lens",
    image: ZEISS_IMG,
  },
  {
    slug: "bleequp-ranger-ultimate-bundle",
    label: "Ranger — Ultimate Bundle",
    shortLabel: "Ultimate Bundle",
    image: BUNDLE_IMG,
  },
];

const ROVER_ACCESSORIES: readonly NavProductLink[] = [
  {
    slug: "bleequp-rover-power-plus",
    label: "Rover Power Plus",
    shortLabel: "Rover Power Plus",
    image: ROVER_POWER_IMG,
  },
  {
    slug: "bleequp-rover-zeiss-lens",
    label: "Rover ZEISS Lens",
    shortLabel: "Rover ZEISS Lens",
    image: ROVER_LENS_IMG,
  },
  {
    slug: "bleequp-rover-photochromic-lens",
    label: "Rover Photochromic Lens",
    shortLabel: "Rover Photochromic",
    image: "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-lens-photochromic.webp?v=1788538095",
  },
  {
    slug: "bleequp-rover-polarized-lens",
    label: "Rover Polarized Lens",
    shortLabel: "Rover Polarized",
    image: "https://cdn.shopify.com/s/files/1/0674/8527/0213/files/rover-lens-polarized.webp?v=1788538103",
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
      "Authorized retailer for BleeqUp AI sports camera glasses and MGI & Motocaddy electric golf trolleys, caddies, and gear.",
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
    rangerProducts: [...ROVER_LINEUP, ...RANGER_LINEUP],
    accessoryProducts: [
      ...ROVER_ACCESSORIES,
      {
        slug: "bleequp-power-plus",
        label: "Power Plus",
        shortLabel: "Power Plus",
        image: "",
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
    tagline: "Rover & Ranger AI Sports Glasses",
    description:
      "Buy BleeqUp Rover and Ranger AI sports glasses in Canada. Official authorized retailer — CAD pricing and free 30-day returns.",
    supportEmail: "info@bleequp.ca",
    freeShippingOver: 500,
    categories: ["ai-glasses", "wearables"],
    lockMarket: "CA",
    storagePrefix: "bleeq_ca",
    cartStorageKey: "bleeq_ca_cart_v1",
    themeStorageKey: "bleeq_ca_theme_v1",
    newsletterSubscribedKey: "bleeq_ca_newsletter_subscribed_v1",
    // Bumped to v3 so the closeable expo popup re-shows after the mobile close-button fix.
    newsletterDismissedKey: "bleeq_ca_newsletter_dismissed_v3",
    rangerProducts: [...ROVER_LINEUP, ...RANGER_LINEUP],
    accessoryProducts: [
      ...ROVER_ACCESSORIES,
      {
        slug: "bleequp-power-plus",
        label: "Power Plus",
        shortLabel: "Power Plus",
        image: "",
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

  for (const site of Object.values(SITES)) {
    if (site.id === "bleeq-ca") continue;
    if (site.hosts.includes(host)) return site.id;
  }
  return null;
}

/**
 * Host wins in production (one deploy → verveacesports.com + ca.bleequp.com).
 * SITE_ID overrides only for localhost / *.vercel.app so you can preview Bleeq
 * before the domain is attached — do NOT set SITE_ID on Production.
 */
export function resolveSiteId(opts: {
  hostname?: string | null;
  envSiteId?: string | null;
}): SiteId {
  const env = opts.envSiteId?.trim().toLowerCase();
  const envSite: SiteId | null =
    env === "bleeq-ca" || env === "verveace" ? env : null;

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
