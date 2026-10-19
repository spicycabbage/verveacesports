export type CatalogCopy = {
  name: string;
  description: string;
  /** Footer / header full label (e.g. "Ranger — Standard Lens"). */
  navLabel?: string;
  /** Compact nav label (e.g. "Standard Lens"). */
  shortLabel?: string;
};

export type CatalogMap = Record<string, CatalogCopy>;
