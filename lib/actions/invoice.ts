"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";
import { parsePosCustomerEmail } from "@/lib/pos/customer-email";
import { sendExistingOrderEmail } from "@/lib/orders/send-order-email";
import type { ShippingAddress } from "@/lib/supabase/types";

const schema = z.object({
  orderId: z.string().uuid(),
  email: z.string().trim().max(200),
  customerName: z.string().trim().max(80),
  send: z.boolean(),
});

function withBillName(addr: ShippingAddress | null, name: string): ShippingAddress | null {
  const fullName = name.trim();
  if (!addr) {
    if (!fullName) return null;
    return {
      full_name: fullName,
      line1: "",
      city: "",
      state: "",
      postal_code: "",
      country: "CA",
    };
  }
  if (addr.full_name === fullName) return addr;
  return { ...addr, full_name: fullName || addr.full_name };
}

export async function saveInvoiceContact(input: {
  orderId: string;
  email: string;
  customerName: string;
  send: boolean;
}): Promise<{ ok: true; sent: boolean } | { error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const email = parsePosCustomerEmail(parsed.data.email);
  if (parsed.data.email && !email) return { error: "Invalid email" };
  if (parsed.data.send && !email) return { error: "Enter a valid email to send" };

  const admin = createSupabaseAdminClient();
  const { data: order, error: loadErr } = await admin
    .from("orders")
    .select("id, shipping_address")
    .eq("id", parsed.data.orderId)
    .maybeSingle();
  if (loadErr) return { error: loadErr.message };
  if (!order) return { error: "Order not found" };

  const { error: saveErr } = await admin
    .from("orders")
    .update({
      email: email ?? null,
      shipping_address: withBillName(
        order.shipping_address as ShippingAddress | null,
        parsed.data.customerName,
      ),
    })
    .eq("id", parsed.data.orderId);
  if (saveErr) return { error: saveErr.message };

  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath(`/admin/orders/${parsed.data.orderId}/invoice`);

  if (!parsed.data.send) return { ok: true, sent: false };

  const result = await sendExistingOrderEmail(admin, parsed.data.orderId);
  if (!result.ok) return { error: result.error };
  return { ok: true, sent: true };
}
