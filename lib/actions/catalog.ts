"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";
import { CATEGORIES } from "@/lib/constants";

const PRODUCT_IMAGE_BUCKET = "product-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type ActionResult = { ok: true } | { error: string };

const categorySchema = z.enum(CATEGORIES);

const updateProductSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(20_000),
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

  const { error } = await admin
    .from("products")
    .update({
      name: d.name,
      description: d.description,
      category: d.category,
      is_active: d.isActive,
      images: d.images,
    })
    .eq("id", d.productId);
  if (error) return { error: error.message };

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

export async function uploadProductImage(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const productId = formData.get("productId");
  const file = formData.get("file");
  if (typeof productId !== "string" || !z.string().uuid().safeParse(productId).success) {
    return { error: "Invalid product" };
  }
  if (!(file instanceof File) || file.size === 0) return { error: "No file selected" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be 5 MB or smaller" };
  if (!file.type.startsWith("image/")) return { error: "File must be an image" };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${safeExt}`;

  const admin = createSupabaseAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });
  if (uploadError) {
    return {
      error: uploadError.message.includes("Bucket not found")
        ? "Storage bucket product-images is missing — run migration 0007 or create the bucket in Supabase Storage"
        : uploadError.message,
    };
  }

  const { data: urlData } = admin.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return { url: urlData.publicUrl };
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
      price_usd: d.priceUsd,
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
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
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
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
}
