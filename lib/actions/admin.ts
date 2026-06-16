"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const statusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]),
});

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single<{ is_admin: boolean }>();
  if (!data?.is_admin) return { ok: false, error: "Forbidden" };
  return { ok: true };
}

const inventorySchema = z.object({
  productId: z.string().uuid(),
  slug: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export async function updateProductInventory(input: z.infer<typeof inventorySchema>) {
  const parsed = inventorySchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("products")
    .update({
      stock: parsed.data.stock,
      is_active: parsed.data.isActive,
    })
    .eq("id", parsed.data.productId);
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${parsed.data.slug}`);
  revalidatePath("/");
  return { ok: true };
}

export async function updateOrderStatus(input: {
  orderId: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
}) {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${parsed.data.orderId}`);
  return { ok: true };
}
