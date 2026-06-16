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
  priceUsd: z.coerce.number().nonnegative(),
  priceCad: z.coerce.number().nonnegative(),
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
      price_usd: d.priceUsd,
      price_cad: d.priceCad,
    })
    .eq("id", d.productId);
  if (error) return { error: error.message };

  const { data: defaultVariant } = await admin
    .from("product_variants")
    .select("id")
    .eq("product_id", d.productId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (defaultVariant) {
    await admin
      .from("product_variants")
      .update({ price_usd: d.priceUsd, price_cad: d.priceCad })
      .eq("id", defaultVariant.id);
  }

  revalidateCatalog(d.productId, existing.slug);
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

function revalidateCatalog(productId: string, slug: string) {
  revalidatePath("/admin/catalog");
  revalidatePath(`/admin/catalog/${productId}`);
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
}
