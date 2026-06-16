"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

type ActionResult = { ok: true } | { error: string };

const moveSchema = z.object({
  variantId: z.string().uuid(),
  locationId: z.string().uuid(),
  delta: z.coerce.number().int(),
  reason: z
    .enum(["purchase", "adjustment", "return", "transfer", "recount"])
    .default("adjustment"),
  note: z.string().max(500).optional(),
});

// Relative stock movement (receive PO, shrinkage, etc.).
export async function moveInventory(input: z.infer<typeof moveSchema>): Promise<ActionResult> {
  const parsed = moveSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.rpc("inventory_move", {
    p_variant: parsed.data.variantId,
    p_location: parsed.data.locationId,
    p_delta: parsed.data.delta,
    p_reason: parsed.data.reason,
    p_note: parsed.data.note ?? null,
    p_actor: guard.userId,
  });
  if (error) {
    return {
      error: error.message.includes("NEGATIVE_INVENTORY")
        ? "Stock can't go below zero"
        : error.message,
    };
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  return { ok: true };
}

const setSchema = z.object({
  variantId: z.string().uuid(),
  locationId: z.string().uuid(),
  onHand: z.coerce.number().int().min(0),
  note: z.string().max(500).optional(),
});

// Absolute cycle-count to a known quantity.
export async function setInventoryOnHand(input: z.infer<typeof setSchema>): Promise<ActionResult> {
  const parsed = setSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.rpc("inventory_set_on_hand", {
    p_variant: parsed.data.variantId,
    p_location: parsed.data.locationId,
    p_new_on_hand: parsed.data.onHand,
    p_note: parsed.data.note ?? null,
    p_actor: guard.userId,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  return { ok: true };
}

const variantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().trim().max(64).optional(),
  title: z.string().trim().min(1).max(120),
  option1: z.string().trim().max(120).optional(),
  option2: z.string().trim().max(120).optional(),
  option3: z.string().trim().max(120).optional(),
  priceUsd: z.coerce.number().nonnegative(),
  priceCad: z.coerce.number().nonnegative(),
  initialStock: z.coerce.number().int().min(0).default(0),
});

export async function createVariant(input: z.infer<typeof variantSchema>): Promise<ActionResult> {
  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const d = parsed.data;
  const { data: variant, error } = await admin
    .from("product_variants")
    .insert({
      product_id: d.productId,
      sku: d.sku || null,
      title: d.title,
      option1: d.option1 || null,
      option2: d.option2 || null,
      option3: d.option3 || null,
      price_usd: d.priceUsd,
      price_cad: d.priceCad,
    })
    .select("id")
    .single();
  if (error || !variant) return { error: error?.message ?? "Failed to create variant" };

  const { data: loc } = await admin
    .from("locations")
    .select("id")
    .eq("is_default", true)
    .single();
  if (loc && d.initialStock > 0) {
    await admin.rpc("inventory_move", {
      p_variant: variant.id,
      p_location: loc.id,
      p_delta: d.initialStock,
      p_reason: "initial",
      p_note: "Initial stock on variant creation",
      p_actor: guard.userId,
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/catalog");
  return { ok: true };
}

const priceSchema = z.object({
  variantId: z.string().uuid(),
  priceUsd: z.coerce.number().nonnegative(),
  priceCad: z.coerce.number().nonnegative(),
  isActive: z.boolean().optional(),
});

export async function updateVariantPrice(input: z.infer<typeof priceSchema>): Promise<ActionResult> {
  const parsed = priceSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const update: Record<string, unknown> = {
    price_usd: parsed.data.priceUsd,
    price_cad: parsed.data.priceCad,
  };
  if (parsed.data.isActive !== undefined) update.is_active = parsed.data.isActive;

  const { error } = await admin
    .from("product_variants")
    .update(update)
    .eq("id", parsed.data.variantId);
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/admin/catalog");
  revalidatePath("/products");
  return { ok: true };
}
