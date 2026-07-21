import type { ProductOption } from "@/lib/supabase/types";

export type VariantOptionKey = "option1" | "option2" | "option3";

const OPTION_KEYS: VariantOptionKey[] = ["option1", "option2", "option3"];
const DEFAULT_OPTION_NAMES = ["Size", "Color", "Style"] as const;

export type StorefrontVariant = {
  id: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  title: string;
  priceUsd: number;
  priceCad: number;
  available: number;
  imageUrl: string | null;
};

export type OptionAxis = {
  key: VariantOptionKey;
  name: string;
  values: string[];
};

export function variantLabel(v: Pick<StorefrontVariant, "option1" | "option2" | "option3" | "title">): string {
  const parts = [v.option1, v.option2, v.option3].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : v.title;
}

export function buildOptionAxes(
  variants: Pick<StorefrontVariant, "option1" | "option2" | "option3">[],
  productOptions: ProductOption[] = [],
): OptionAxis[] {
  const axes: OptionAxis[] = [];
  for (let i = 0; i < OPTION_KEYS.length; i++) {
    const key = OPTION_KEYS[i];
    const values = [
      ...new Set(
        variants
          .map((v) => v[key])
          .filter((val): val is string => Boolean(val?.trim())),
      ),
    ];
    if (values.length <= 1) continue;
    const name =
      productOptions[i]?.name?.trim() ||
      DEFAULT_OPTION_NAMES[i] ||
      `Option ${i + 1}`;
    axes.push({ key, name, values });
  }
  return axes;
}

export function shouldShowVariantPicker(
  variants: StorefrontVariant[],
  axes: OptionAxis[],
): boolean {
  return productUsesVariants(variants, axes);
}

/** True when a product has meaningful size/color/etc. options (not a single SKU). */
export function productUsesVariants(
  variants: Pick<StorefrontVariant, "option1" | "option2" | "option3">[],
  productOptionsOrAxes: ProductOption[] | OptionAxis[] = [],
): boolean {
  const axes =
    productOptionsOrAxes.length > 0 &&
    "key" in (productOptionsOrAxes[0] ?? {})
      ? (productOptionsOrAxes as OptionAxis[])
      : buildOptionAxes(variants, productOptionsOrAxes as ProductOption[]);
  return variants.length > 1 || axes.length > 0;
}

export function findVariantBySelection(
  variants: StorefrontVariant[],
  selection: Partial<Record<VariantOptionKey, string>>,
): StorefrontVariant | undefined {
  return variants.find((v) =>
    OPTION_KEYS.every((key) => {
      const selected = selection[key];
      if (!selected) return true;
      return v[key] === selected;
    }),
  );
}

export function initialSelection(
  variants: StorefrontVariant[],
  axes: OptionAxis[],
): Partial<Record<VariantOptionKey, string>> {
  const first = variants.find((v) => v.available > 0) ?? variants[0];
  if (!first) return {};
  const selection: Partial<Record<VariantOptionKey, string>> = {};
  for (const axis of axes) {
    if (first[axis.key]) selection[axis.key] = first[axis.key]!;
  }
  return selection;
}

/** Variant hero images first (position order), then extra lifestyle shots from the product gallery. */
export function buildProductGalleryImages(
  productImages: string[],
  variants: Pick<StorefrontVariant, "imageUrl">[],
): string[] {
  const variantHeroes = variants
    .map((v) => v.imageUrl)
    .filter((url): url is string => Boolean(url?.trim()));
  const uniqueHeroes = [...new Set(variantHeroes)];
  if (uniqueHeroes.length === 0) return productImages.length > 0 ? productImages : [];
  const extras = productImages.filter((img) => !uniqueHeroes.includes(img));
  return [...uniqueHeroes, ...extras];
}
