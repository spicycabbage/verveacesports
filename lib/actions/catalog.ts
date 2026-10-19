"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateCatalogCache } from "@/lib/catalog/invalidate";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";
import { CATEGORIES } from "@/lib/constants";
import { compactProductTranslations } from "@/lib/i18n/product-translations";
import { isMissingColumn } from "@/lib/supabase/order-row";
import { submitProductToIndexNow } from "@/lib/site/indexnow";

const PRODUCT_IMAGE_BUCKET = "product-images";

type ActionResult = { ok: true } | { error: string };

const categorySchema = z.enum(CATEGORIES);

const localeCopySchema = z.object({
  name: z.string().trim().max(200).optional(),
  description: z.string().max(20_000).optional(),
});

const updateProductSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(20_000),
  translations: z.record(z.string(), localeCopySchema).optional(),
  category: categorySchema,
  isActive: z.boolean(),
  images: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .refine((u) => u.startsWith("https://") || u.startsWith("http://"), {
          message: "Image URL must start with http:// or https://",
        }),
    )
    .max(12),
});

const saveProductEditSchema = updateProductSchema.extend({
  locationId: z.string().uuid().optional(),
  option1Name: z.string().trim().max(40).optional(),
  option2Name: z.string().trim().max(40).optional(),
  option3Name: z.string().trim().max(40).optional(),
  persistOptions: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        sku: z.string().trim().max(64).optional(),
        title: z.string().trim().min(1).max(120),
        option1: z.union([z.string().trim().max(120), z.null()]).optional(),
        option2: z.union([z.string().trim().max(120), z.null()]).optional(),
        option3: z.union([z.string().trim().max(120), z.null()]).optional(),
        priceUsd: z.coerce.number().nonnegative(),
        priceCad: z.coerce.number().nonnegative(),
        isActive: z.boolean(),
        onHand: z.number().int().min(0).optional(),
      }),
    )
    .max(50)
    .optional(),
});

/**
 * One request, one getUser(). Chaining catalog + variant actions burns the
 * refresh token on the first call and 401s the price write.
 */
export async function saveProductEdit(
  input: z.infer<typeof saveProductEditSchema>,
): Promise<ActionResult> {
  const parsed = saveProductEditSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const d = parsed.data;

  const { data: existing, error: fetchErr } = await admin
    .from("products")
    .select("slug")
    .eq("id", d.productId)
    .single<{ slug: string }>();
  if (fetchErr || !existing) return { error: "Product not found" };

  const translations = compactProductTranslations(d.translations ?? {});
  const productPatch: Record<string, unknown> = {
    name: d.name,
    description: d.description,
    category: d.category,
    is_active: d.isActive,
    images: d.images,
    translations,
  };

  if (d.persistOptions) {
    productPatch.options = [
      d.option1Name ? { name: d.option1Name, values: [] as string[] } : null,
      d.option2Name ? { name: d.option2Name, values: [] as string[] } : null,
      d.option3Name ? { name: d.option3Name, values: [] as string[] } : null,
    ].filter(Boolean);
  }

  if (d.variants?.length === 1) {
    const cad = d.variants[0].priceCad;
    productPatch.price_usd = cad;
    productPatch.price_cad = cad;
  }

  const { error: productErr } = await admin
    .from("products")
    .update(productPatch)
    .eq("id", d.productId);
  if (productErr && isMissingColumn(productErr.message, "translations")) {
    delete productPatch.translations;
    const retry = await admin.from("products").update(productPatch).eq("id", d.productId);
    if (retry.error) return { error: retry.error.message };
  } else if (productErr) {
    return { error: productErr.message };
  }

  for (const v of d.variants ?? []) {
    const { data: updated, error: variantErr } = await admin
      .from("product_variants")
      .update({
        sku: v.sku || null,
        title: v.title || "Default",
        option1: v.option1 ?? null,
        option2: v.option2 ?? null,
        option3: v.option3 ?? null,
        price_usd: v.priceCad,
        price_cad: v.priceCad,
        is_active: v.isActive,
      })
      .eq("id", v.variantId)
      .eq("product_id", d.productId)
      .select("id, price_usd, price_cad")
      .maybeSingle<{ id: string; price_usd: number; price_cad: number }>();
    if (variantErr) return { error: variantErr.message };
    if (!updated) return { error: "Variant not found — price was not saved" };
    if (
      Math.round(Number(updated.price_usd) * 100) !== Math.round(v.priceCad * 100) ||
      Math.round(Number(updated.price_cad) * 100) !== Math.round(v.priceCad * 100)
    ) {
      return { error: "Price write did not stick — refresh and try again" };
    }

    if (v.onHand !== undefined && d.locationId) {
      const { error: stockErr } = await admin.rpc("inventory_set_on_hand", {
        p_variant: v.variantId,
        p_location: d.locationId,
        p_new_on_hand: v.onHand,
        p_note: "Admin product save",
        p_actor: guard.userId,
      });
      if (stockErr) return { error: stockErr.message };
    }
  }

  revalidateCatalog(d.productId, existing.slug);
  return { ok: true };
}

export async function updateProductCatalog(
  input: z.infer<typeof updateProductSchema>,
): Promise<ActionResult> {
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const d = parsed.data;

  const { data: existing, error: fetchErr } = await admin
    .from("products")
    .select("slug")
    .eq("id", d.productId)
    .single<{ slug: string }>();
  if (fetchErr || !existing) return { error: "Product not found" };

  const translations = compactProductTranslations(d.translations ?? {});
  const productPatch: Record<string, unknown> = {
    name: d.name,
    description: d.description,
    category: d.category,
    is_active: d.isActive,
    images: d.images,
    translations,
  };
  const { error } = await admin.from("products").update(productPatch).eq("id", d.productId);
  if (error && isMissingColumn(error.message, "translations")) {
    delete productPatch.translations;
    const retry = await admin.from("products").update(productPatch).eq("id", d.productId);
    if (retry.error) return { error: retry.error.message };
  } else if (error) {
    return { error: error.message };
  }

  await admin.from("product_variants").update({ is_active: d.isActive }).eq("product_id", d.productId);

  revalidateCatalog(d.productId, existing.slug);
  return { ok: true };
}

const visibilitySchema = z.object({
  productId: z.string().uuid(),
  isActive: z.boolean(),
});

/** Toggles the whole product on the storefront (product + all variants). */
export async function setProductStorefrontVisibility(
  input: z.infer<typeof visibilitySchema>,
): Promise<ActionResult> {
  const parsed = visibilitySchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { productId, isActive } = parsed.data;

  const { data: product, error: fetchErr } = await admin
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single<{ slug: string }>();
  if (fetchErr || !product) return { error: "Product not found" };

  const { error: productErr } = await admin
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId);
  if (productErr) return { error: productErr.message };

  await admin.from("product_variants").update({ is_active: isActive }).eq("product_id", productId);

  revalidateCatalog(productId, product.slug);
  return { ok: true };
}

const optionSchema = z.object({
  productId: z.string().uuid(),
  option1Name: z.string().trim().max(40).optional(),
  option2Name: z.string().trim().max(40).optional(),
  option3Name: z.string().trim().max(40).optional(),
});

export async function updateProductOptions(
  input: z.infer<typeof optionSchema>,
): Promise<ActionResult> {
  const parsed = optionSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const d = parsed.data;
  const options = [
    d.option1Name ? { name: d.option1Name, values: [] as string[] } : null,
    d.option2Name ? { name: d.option2Name, values: [] as string[] } : null,
    d.option3Name ? { name: d.option3Name, values: [] as string[] } : null,
  ].filter(Boolean);

  const { data: existing } = await admin
    .from("products")
    .select("slug")
    .eq("id", d.productId)
    .single<{ slug: string }>();
  if (!existing) return { error: "Product not found" };

  const { error } = await admin
    .from("products")
    .update({ options })
    .eq("id", d.productId);
  if (error) return { error: error.message };

  revalidateCatalog(d.productId, existing.slug);
  return { ok: true };
}

const updateVariantSchema = z.object({
  variantId: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string().trim().max(64).optional(),
  title: z.string().trim().min(1).max(120),
  option1: z.string().trim().max(120).optional(),
  option2: z.string().trim().max(120).optional(),
  option3: z.string().trim().max(120).optional(),
  priceUsd: z.coerce.number().nonnegative(),
  priceCad: z.coerce.number().nonnegative(),
  isActive: z.boolean(),
});

export async function updateVariantDetails(
  input: z.infer<typeof updateVariantSchema>,
): Promise<ActionResult> {
  const parsed = updateVariantSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const d = parsed.data;

  const { data: product } = await admin
    .from("products")
    .select("slug")
    .eq("id", d.productId)
    .single<{ slug: string }>();
  if (!product) return { error: "Product not found" };

  const { error } = await admin
    .from("product_variants")
    .update({
      sku: d.sku || null,
      title: d.title,
      option1: d.option1 || null,
      option2: d.option2 || null,
      option3: d.option3 || null,
      price_usd: d.priceCad,
      price_cad: d.priceCad,
      is_active: d.isActive,
    })
    .eq("id", d.variantId)
    .eq("product_id", d.productId);
  if (error) return { error: error.message };

  revalidateCatalog(d.productId, product.slug);
  revalidatePath("/admin/products");
  return { ok: true };
}

const deleteProductSchema = z.object({
  productId: z.string().uuid(),
});

const deleteProductsSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(100),
});

type DeleteProductResult = { ok: true; slug: string } | { error: string };

async function deleteProductRecord(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  productId: string,
): Promise<DeleteProductResult> {
  const { data: product, error: fetchErr } = await admin
    .from("products")
    .select("slug")
    .eq("id", productId)
    .single<{ slug: string }>();
  if (fetchErr || !product) return { error: "Product not found" };

  const { count, error: countErr } = await admin
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  if (countErr) return { error: countErr.message };
  if ((count ?? 0) > 0) {
    return {
      error:
        "This product has order history and can't be deleted. Hide it from the storefront instead.",
    };
  }

  const { data: stored } = await admin.storage.from(PRODUCT_IMAGE_BUCKET).list(productId);
  if (stored?.length) {
    await admin.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .remove(stored.map((f) => `${productId}/${f.name}`));
  }

  const { error: deleteErr } = await admin.from("products").delete().eq("id", productId);
  if (deleteErr) {
    return {
      error: deleteErr.message.includes("foreign key")
        ? "This product can't be deleted because it's linked to other records. Hide it instead."
        : deleteErr.message,
    };
  }

  return { ok: true, slug: product.slug };
}

function revalidateAfterProductDelete(slug: string) {
  updateCatalogCache();
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
  submitProductToIndexNow(slug);
}

/** Permanently removes a product. Blocked if any order_items reference it. */
export async function deleteProduct(
  input: z.infer<typeof deleteProductSchema>,
): Promise<ActionResult> {
  const parsed = deleteProductSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const result = await deleteProductRecord(admin, parsed.data.productId);
  if ("error" in result) return { error: result.error };

  revalidateAfterProductDelete(result.slug);
  return { ok: true };
}

export type BulkDeleteProductsResult =
  | {
      ok: true;
      deletedCount: number;
      failed: { productId: string; error: string }[];
    }
  | { error: string };

/** Permanently removes multiple products. Skips items with order history or other blockers. */
export async function deleteProducts(
  input: z.infer<typeof deleteProductsSchema>,
): Promise<BulkDeleteProductsResult> {
  const parsed = deleteProductsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const failed: { productId: string; error: string }[] = [];
  const deletedSlugs: string[] = [];

  for (const productId of parsed.data.productIds) {
    const result = await deleteProductRecord(admin, productId);
    if ("error" in result) {
      failed.push({ productId, error: result.error });
    } else {
      deletedSlugs.push(result.slug);
    }
  }

  for (const slug of deletedSlugs) {
    revalidateAfterProductDelete(slug);
  }

  if (deletedSlugs.length === 0 && failed.length > 0) {
    return { error: failed[0]?.error ?? "Could not delete selected products" };
  }

  return { ok: true, deletedCount: deletedSlugs.length, failed };
}

function revalidateCatalog(productId: string, slug: string) {
  updateCatalogCache();
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
  submitProductToIndexNow(slug);
}
