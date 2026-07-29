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

const deleteUserSchema = z.object({
  userId: z.string().uuid(),
});

export async function deleteAdminUser(input: { userId: string }) {
  const parsed = deleteUserSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: actor },
  } = await supabase.auth.getUser();
  if (!actor) return { error: "Not authenticated" };
  if (actor.id === parsed.data.userId) {
    return { error: "You can’t delete your own account from here" };
  }

  const admin = createSupabaseAdminClient();
  const { data: target } = await admin
    .from("profiles")
    .select("id, email, is_admin")
    .eq("id", parsed.data.userId)
    .maybeSingle();
  if (!target) return { error: "User not found" };

  const { error } = await admin.auth.admin.deleteUser(parsed.data.userId);
  if (error) {
    const msg = error.message || "Failed to delete user";
    if (/foreign key|restrict|orders/i.test(msg)) {
      return {
        error:
          "This user has orders and can’t be deleted until migration 0035_orders_user_id_set_null.sql is applied.",
      };
    }
    return { error: msg };
  }

  revalidatePath("/admin/users");
  return { ok: true as const, email: target.email as string };
}

const deleteLeadSchema = z.object({
  subscriberId: z.string().uuid(),
});

export async function deleteNewsletterLead(input: { subscriberId: string }) {
  const parsed = deleteLeadSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const admin = createSupabaseAdminClient();
  const { data: target } = await admin
    .from("newsletter_subscribers")
    .select("id, email")
    .eq("id", parsed.data.subscriberId)
    .maybeSingle();
  if (!target) return { error: "Lead not found" };

  const { error } = await admin
    .from("newsletter_subscribers")
    .delete()
    .eq("id", parsed.data.subscriberId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { ok: true as const, email: target.email as string };
}
