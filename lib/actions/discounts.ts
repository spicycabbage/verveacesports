"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";
import { parseOptionalDatetime } from "@/lib/admin/datetime";

type ActionResult = { ok: true } | { error: string };

const discountFieldsSchema = z.object({
  type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  value: z.coerce.number().nonnegative().default(0),
  appliesTo: z.enum(["order", "shipping"]).default("order"),
  minSubtotal: z.coerce.number().nonnegative().default(0),
  usageLimit: z.coerce.number().int().positive().optional(),
  perCustomerLimit: z.coerce.number().int().positive().optional(),
  oncePerCustomer: z.boolean().default(false),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

const createSchema = discountFieldsSchema.extend({
  code: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only"),
});

const updateSchema = discountFieldsSchema.extend({
  discountId: z.string().uuid(),
  code: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only"),
});

function validateDiscountValues(
  d: z.infer<typeof discountFieldsSchema>,
): string | null {
  if (d.type === "percentage" && d.value > 100) return "Percentage can't exceed 100";
  if (d.oncePerCustomer && d.perCustomerLimit) {
    return "Use either once per customer or a custom per-customer limit, not both";
  }
  const starts = parseOptionalDatetime(d.startsAt);
  const ends = parseOptionalDatetime(d.endsAt);
  if (starts && ends && new Date(starts) >= new Date(ends)) {
    return "End date must be after start date";
  }
  return null;
}

function discountRow(d: z.infer<typeof discountFieldsSchema>) {
  return {
    type: d.type,
    value: d.value,
    applies_to: d.type === "free_shipping" ? "shipping" : d.appliesTo,
    min_subtotal: d.minSubtotal,
    usage_limit: d.usageLimit ?? null,
    per_customer_limit: d.oncePerCustomer ? null : (d.perCustomerLimit ?? null),
    once_per_customer: d.oncePerCustomer,
    starts_at: parseOptionalDatetime(d.startsAt),
    ends_at: parseOptionalDatetime(d.endsAt),
  };
}

export async function createDiscount(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const d = parsed.data;
  const validationError = validateDiscountValues(d);
  if (validationError) return { error: validationError };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("discounts").insert({
    code: d.code.toUpperCase(),
    ...discountRow(d),
  });
  if (error) {
    return { error: error.code === "23505" ? "Code already exists" : error.message };
  }

  revalidatePath("/admin/discounts");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function updateDiscount(input: z.infer<typeof updateSchema>): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const d = parsed.data;
  const validationError = validateDiscountValues(d);
  if (validationError) return { error: validationError };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("discounts")
    .update({
      code: d.code.toUpperCase(),
      ...discountRow(d),
    })
    .eq("id", d.discountId);
  if (error) {
    return { error: error.code === "23505" ? "Code already exists" : error.message };
  }

  revalidatePath("/admin/discounts");
  revalidatePath("/checkout");
  return { ok: true };
}

const toggleSchema = z.object({
  discountId: z.string().uuid(),
  isActive: z.boolean(),
});

export async function toggleDiscount(input: z.infer<typeof toggleSchema>): Promise<ActionResult> {
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("discounts")
    .update({ is_active: parsed.data.isActive })
    .eq("id", parsed.data.discountId);
  if (error) return { error: error.message };

  revalidatePath("/admin/discounts");
  revalidatePath("/checkout");
  return { ok: true };
}

const deleteSchema = z.object({
  discountId: z.string().uuid(),
});

export async function deleteDiscount(input: z.infer<typeof deleteSchema>): Promise<ActionResult> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("discounts").delete().eq("id", parsed.data.discountId);
  if (error) return { error: error.message };

  revalidatePath("/admin/discounts");
  revalidatePath("/checkout");
  return { ok: true };
}
