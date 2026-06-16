"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

type ActionResult = { ok: true } | { error: string };

const createSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only"),
  type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  value: z.coerce.number().nonnegative().default(0),
  appliesTo: z.enum(["order", "shipping"]).default("order"),
  minSubtotal: z.coerce.number().nonnegative().default(0),
  usageLimit: z.coerce.number().int().positive().optional(),
  perCustomerLimit: z.coerce.number().int().positive().optional(),
  oncePerCustomer: z.boolean().default(false),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export async function createDiscount(input: z.infer<typeof createSchema>): Promise<ActionResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const d = parsed.data;
  if (d.type === "percentage" && d.value > 100) return { error: "Percentage can't exceed 100" };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("discounts").insert({
    code: d.code.toUpperCase(),
    type: d.type,
    value: d.value,
    applies_to: d.type === "free_shipping" ? "shipping" : d.appliesTo,
    min_subtotal: d.minSubtotal,
    usage_limit: d.usageLimit ?? null,
    per_customer_limit: d.perCustomerLimit ?? null,
    once_per_customer: d.oncePerCustomer,
    starts_at: d.startsAt ?? null,
    ends_at: d.endsAt ?? null,
  });
  if (error) {
    return { error: error.code === "23505" ? "Code already exists" : error.message };
  }

  revalidatePath("/admin/discounts");
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
  return { ok: true };
}
