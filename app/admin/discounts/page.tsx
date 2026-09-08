import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DiscountManager } from "./DiscountManager";
import type { Discount } from "@/lib/supabase/types";
import { requireAdminPage } from "@/lib/auth/admin";

export const metadata = { title: "Admin · Coupons" };

export default async function AdminCouponsPage() {
  await requireAdminPage();
  const admin = createSupabaseAdminClient();
  const { data: discounts } = await admin
    .from("discounts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
        <p className="text-sm text-muted-foreground">
          Promo codes — percentage off, fixed amount, or free shipping. Limits and expiry are
          enforced at checkout.
        </p>
      </div>
      <DiscountManager discounts={(discounts ?? []) as Discount[]} />
    </div>
  );
}
