/** Feature matrix for electric golf carts (control mode + GPS). */

export const CART_FEATURE_IDS = [
  "follow-me",
  "remote",
  "no-remote",
  "gps",
] as const;

export type CartFeatureId = (typeof CART_FEATURE_IDS)[number];

export type CartFeatureFlags = {
  followMe: boolean;
  remote: boolean;
  noRemote: boolean;
  gps: boolean;
};

/** Slug → feature flags from the MGI / Motocaddy / Volt Caddy comparison matrix. */
export const CART_FEATURES_BY_SLUG: Record<string, CartFeatureFlags> = {
  "volt-caddy-pro-s": {
    followMe: false,
    remote: true,
    noRemote: false,
    gps: false,
  },
  "mgi-ai-navigator-halo-halo-eye-bundle": {
    followMe: true,
    remote: true,
    noRemote: false,
    gps: true,
  },
  "mgi-ai-navigator-halo": {
    followMe: false,
    remote: true,
    noRemote: false,
    gps: true,
  },
  "mgi-ai-navigator-gps": {
    followMe: false,
    remote: true,
    noRemote: false,
    gps: true,
  },
  "mgi-e-boost-pushcart": {
    followMe: false,
    remote: false,
    noRemote: true,
    gps: false,
  },
  "mgi-zip-navigator-at-all-terrain": {
    followMe: false,
    remote: true,
    noRemote: false,
    gps: false,
  },
  "mgi-zip-navigator": {
    followMe: false,
    remote: true,
    noRemote: false,
    gps: false,
  },
  "mgi-zip-x1": {
    followMe: false,
    remote: true,
    noRemote: false,
    gps: false,
  },
  "mgi-zip-x5": {
    followMe: false,
    remote: true,
    noRemote: false,
    gps: false,
  },
  "motocaddy-m1-dhc-2026": {
    followMe: false,
    remote: false,
    noRemote: true,
    gps: false,
  },
  "motocaddy-m5-gps-dhc-2026": {
    followMe: false,
    remote: false,
    noRemote: true,
    gps: true,
  },
  "motocaddy-m7-gps-2026": {
    followMe: false,
    remote: true,
    noRemote: false,
    gps: true,
  },
  "motocaddy-m7-2026": {
    followMe: false,
    remote: true,
    noRemote: false,
    gps: false,
  },
};

export function cartHasFeature(
  slug: string,
  feature: CartFeatureId,
): boolean {
  const flags = CART_FEATURES_BY_SLUG[slug];
  if (!flags) return false;
  switch (feature) {
    case "follow-me":
      return flags.followMe;
    case "remote":
      return flags.remote;
    case "no-remote":
      return flags.noRemote;
    case "gps":
      return flags.gps;
    default: {
      const _exhaustive: never = feature;
      return _exhaustive;
    }
  }
}
