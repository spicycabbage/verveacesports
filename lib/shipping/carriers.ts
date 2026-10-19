export const SHIPPING_CARRIERS = [
  { id: "canada-post", label: "Canada Post" },
  { id: "intelcom-dragonfly", label: "Intelcom Dragonfly" },
] as const;

export type ShippingCarrierId = (typeof SHIPPING_CARRIERS)[number]["id"];

export function isShippingCarrierId(value: string): value is ShippingCarrierId {
  return SHIPPING_CARRIERS.some((carrier) => carrier.id === value);
}

export function carrierLabel(id: ShippingCarrierId): string {
  switch (id) {
    case "canada-post":
      return "Canada Post";
    case "intelcom-dragonfly":
      return "Intelcom Dragonfly";
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function trackingUrlFor(id: ShippingCarrierId, trackingNumber: string): string {
  const n = encodeURIComponent(trackingNumber.trim());
  switch (id) {
    case "canada-post":
      return `https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=${n}`;
    case "intelcom-dragonfly":
      return `https://dragonflyshipping.ca/en/track-your-package/?tracking-id=${n}`;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

export function carrierIdFromCompany(company: string | null | undefined): ShippingCarrierId | null {
  const raw = company?.trim().toLowerCase() ?? "";
  if (raw === "canada post" || raw === "canada-post") return "canada-post";
  if (
    raw === "intelcom dragonfly" ||
    raw === "intelcom-dragonfly" ||
    raw === "intelcom" ||
    raw === "dragonfly"
  ) {
    return "intelcom-dragonfly";
  }
  return null;
}

export function resolveTrackingUrl(opts: {
  company?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
}): string | null {
  const number = opts.trackingNumber?.trim();
  const id = carrierIdFromCompany(opts.company);
  if (id && number) return trackingUrlFor(id, number);
  const existing = opts.trackingUrl?.trim();
  return existing || null;
}
