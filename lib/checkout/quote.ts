import type { SupabaseClient } from "@supabase/supabase-js";
import { LOYALTY, normalizeTaxRegion } from "@/lib/constants";
import { normalizeVariantPrices } from "@/lib/catalog/pricing";
import { siteAllowsCategory, type SiteConfig } from "@/lib/site/config";
import { buildTaxLines, type TaxLine } from "@/lib/tax/label";
import { parsePosManualDiscount } from "@/lib/pos/manual-discount";

export type QuoteItem = {
  productId: string;
  variantId?: string;
  qty: number;
};

export type QuoteCustomItem = {
  name: string;
  description?: string;
  unitPrice: number;
  qty: number;
};

export type QuoteInput = {
  items: QuoteItem[];
  currency: "CAD";
  country: "US" | "CA";
  userId?: string;
  /** Active storefront — enforces lockMarket + category catalog. */
  site: SiteConfig;
  pointsToRedeem?: number;
  discountCode?: string;
  /** State/province for regional tax; omit to use country default rate. */
  region?: string;
  /**
   * When true (payment charge), US/CA require a valid normalized region.
   * When false (quote preview), a supplied region must still be valid if present.
   */
  requireValidRegion?: boolean;
  /** In-store pickup: skip shipping. */
  shippingMode?: "ship" | "pickup";
  /** POS one-offs — priced by the cashier, not in the catalog. */
  customItems?: QuoteCustomItem[];
  /** Required to accept `customItems`. Only admin POS routes set this. */
  allowCustomItems?: boolean;
  /** Required for cashier `$` / `%` off. Only admin POS routes set this. */
  allowManualDiscount?: boolean;
};

export type QuoteLineItem = {
  productId: string | null;
  variantId: string | null;
  locationId: string | null;
  qty: number;
  unitPrice: number;
  priceUsd: number;
  priceCad: number;
  unitCostUsd: number | null;
  unitCostCad: number | null;
  name: string;
  sku: string | null;
  image: string | null;
};

export type QuoteResult = {
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountTotal: number;
  discountCode: string | null;
  discountManual: boolean;
  freeShipping: boolean;
  tax: number;
  taxRate: number;
  taxLines: TaxLine[];
  shipping: number;
  redeemPoints: number;
  redeemValue: number;
  total: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export class QuoteError extends Error {
  constructor(
    message: string,
    public status: number = 400,
  ) {
    super(message);
    this.name = "QuoteError";
  }
}

export async function computeCheckoutQuote(
  admin: SupabaseClient,
  input: QuoteInput,
): Promise<QuoteResult> {
  const {
    items,
    currency,
    country,
    userId,
    site,
    pointsToRedeem = 0,
    discountCode,
    region,
    requireValidRegion = false,
    shippingMode = "ship",
    customItems = [],
    allowCustomItems = false,
    allowManualDiscount = false,
  } = input;

  if (customItems.length > 0 && !allowCustomItems) {
    throw new QuoteError("Custom items are POS-only", 400);
  }

  if (currency !== "CAD") {
    throw new QuoteError("This storefront is CAD only", 400);
  }

  if (site.lockMarket) {
    if (country !== site.lockMarket) {
      throw new QuoteError("Market not available on this storefront", 400);
    }
  }

  const regionTrimmed = region?.trim() ?? "";
  const taxRegion = regionTrimmed ? normalizeTaxRegion(country, regionTrimmed) : null;
  if (regionTrimmed && !taxRegion && (country === "US" || country === "CA")) {
    throw new QuoteError("Invalid state/province", 400);
  }
  if (requireValidRegion && (country === "US" || country === "CA") && !taxRegion) {
    throw new QuoteError("State/province is required", 400);
  }

  const { data: location } = await admin
    .from("locations")
    .select("id")
    .eq("is_default", true)
    .single();
  if (!location) throw new QuoteError("No fulfillment location configured", 500);

  if (items.length === 0 && customItems.length === 0) {
    throw new QuoteError("Add an item first", 400);
  }

  const productIds = items.map((i) => i.productId);
  const { data: variants, error: varErr } = productIds.length
    ? await admin
        .from("product_variants")
        .select(
          "id, product_id, sku, title, price_usd, price_cad, cost_usd, cost_cad, is_active, position, products!inner(id, name, slug, images, is_active, category)",
        )
        .in("product_id", productIds)
        .eq("is_active", true)
        .order("position", { ascending: true })
    : { data: [] as never[], error: null };
  if (varErr || !variants) throw new QuoteError("Failed to load products", 500);

  type VariantRow = {
    id: string;
    product_id: string;
    sku: string | null;
    title: string;
    price_usd: number | string;
    price_cad: number | string;
    cost_usd: number | string | null;
    cost_cad: number | string | null;
    is_active: boolean;
    position: number;
    products: {
      id: string;
      name: string;
      slug: string;
      images: string[];
      is_active: boolean;
      category: string;
    };
  };
  const variantList = variants as unknown as VariantRow[];

  const byId = new Map(variantList.map((v) => [v.id, v]));
  const defaultByProduct = new Map<string, VariantRow>();
  for (const v of variantList) {
    if (!defaultByProduct.has(v.product_id)) defaultByProduct.set(v.product_id, v);
  }

  const lineItems: QuoteLineItem[] = [];
  let subtotal = 0;
  for (const it of items) {
    const v = it.variantId ? byId.get(it.variantId) : defaultByProduct.get(it.productId);
    if (!v || !v.products.is_active) {
      throw new QuoteError(`Product unavailable`, 400);
    }
    // Integrity check: a client-supplied variantId must belong to the product
    // it claims, otherwise mismatched price/name snapshots could be forced.
    if (v.product_id !== it.productId) {
      throw new QuoteError("Variant does not belong to product", 400);
    }
    if (!siteAllowsCategory(site, v.products.category)) {
      throw new QuoteError("Product not available on this storefront", 400);
    }
    const prices = normalizeVariantPrices(v);
    const unit = Number(prices.priceCad);
    subtotal += unit * it.qty;
    lineItems.push({
      productId: v.product_id,
      variantId: v.id,
      locationId: location.id,
      qty: it.qty,
      unitPrice: unit,
      priceUsd: prices.priceCad,
      priceCad: prices.priceCad,
      unitCostUsd: v.cost_usd == null ? null : Number(v.cost_usd),
      unitCostCad: v.cost_cad == null ? null : Number(v.cost_cad),
      name: v.products.name,
      sku: v.sku,
      image: v.products.images?.[0] ?? null,
    });
  }

  for (const custom of customItems) {
    const name = custom.name.trim();
    const description = custom.description?.trim() || "";
    const unit = round2(Number(custom.unitPrice));
    if (!name) throw new QuoteError("Custom item needs a name", 400);
    if (!Number.isFinite(unit) || unit < 0.01) {
      throw new QuoteError("Custom item price must be at least $0.01", 400);
    }
    if (custom.qty < 1) throw new QuoteError("Custom item quantity must be at least 1", 400);
    const label = description ? `${name} — ${description}` : name;
    subtotal += unit * custom.qty;
    lineItems.push({
      productId: null,
      variantId: null,
      locationId: null,
      qty: custom.qty,
      unitPrice: unit,
      priceUsd: unit,
      priceCad: unit,
      unitCostUsd: null,
      unitCostCad: null,
      name: label,
      sku: "POS-CUSTOM",
      image: null,
    });
  }

  subtotal = round2(subtotal);

  let discountTotal = 0;
  let freeShipping = false;
  let validatedDiscountCode: string | null = null;
  let discountManual = false;
  if (discountCode) {
    const manual =
      allowManualDiscount ? parsePosManualDiscount(discountCode, subtotal) : null;
    if (manual) {
      discountManual = true;
      discountTotal = manual.amount;
      validatedDiscountCode = manual.label;
    } else {
      const { data: dres } = await admin.rpc("validate_discount", {
        p_code: discountCode,
        p_user: userId ?? null,
        p_subtotal: subtotal,
        p_currency: currency,
      });
      const row = Array.isArray(dres) ? dres[0] : dres;
      if (!row?.valid) {
        throw new QuoteError(
          row?.reason ? `Discount: ${row.reason}` : "Invalid discount code",
          400,
        );
      }
      validatedDiscountCode = discountCode.trim();
      if (row.kind === "free_shipping") {
        freeShipping = true;
      } else {
        discountTotal = round2(Number(row.amount) || 0);
      }
    }
  }

  const discountedSubtotal = Math.max(0, round2(subtotal - discountTotal));

  let redeemPoints = 0;
  let redeemValue = 0;
  if (userId && pointsToRedeem > 0) {
    const { data: profile } = await admin
      .from("profiles")
      .select("loyalty_points")
      .eq("id", userId)
      .single();
    const balance = profile?.loyalty_points ?? 0;
    const safePoints = Math.max(0, Math.min(pointsToRedeem, balance));
    const maxPointsForSubtotal = Math.floor(discountedSubtotal * LOYALTY.POINTS_PER_DOLLAR_REDEEM);
    redeemPoints = Math.min(safePoints, maxPointsForSubtotal);
    redeemValue = round2(redeemPoints / LOYALTY.POINTS_PER_DOLLAR_REDEEM);
  }

  const { data: taxRate } = await admin.rpc("tax_rate_for", {
    p_country: country,
    p_region: taxRegion,
  });
  const rate = Number(taxRate) || 0;
  const taxableBase = Math.max(0, round2(discountedSubtotal - redeemValue));
  const tax = round2(taxableBase * rate);

  const { data: rates } = await admin
    .from("shipping_rates")
    .select("price_usd, price_cad, free_over, shipping_zones!inner(countries)")
    .eq("is_active", true)
    .order("position", { ascending: true });
  type RateRow = {
    price_usd: number | string;
    price_cad: number | string;
    free_over: number | string | null;
    shipping_zones: { countries: string[] };
  };
  const zoneRate = ((rates ?? []) as unknown as RateRow[]).find((r) =>
    r.shipping_zones.countries.includes(country),
  );
  let shipping = 0;
  if (shippingMode !== "pickup" && !freeShipping && zoneRate) {
    const base = Number(zoneRate.price_cad);
    const freeOver = zoneRate.free_over == null ? null : Number(zoneRate.free_over);
    shipping = freeOver != null && discountedSubtotal >= freeOver ? 0 : base;
  }

  const total = Math.max(0, round2(taxableBase + tax + shipping));

  return {
    lineItems,
    subtotal,
    discountTotal,
    discountCode: validatedDiscountCode,
    discountManual,
    freeShipping,
    tax,
    taxRate: rate,
    taxLines: buildTaxLines({
      country,
      region: taxRegion,
      rate,
      tax,
      taxableBase,
    }),
    shipping,
    redeemPoints,
    redeemValue,
    total,
  };
}
