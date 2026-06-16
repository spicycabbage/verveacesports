import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { DiscountManager } from "./DiscountManager";
import type { Discount } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Discounts" };

export default async function AdminDiscountsPage() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("discounts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discounts</h1>
        <p className="text-sm text-muted-foreground">
          Create promo codes. Validation (limits, expiry, minimums) is enforced server-side at
          checkout.
        </p>
      </div>
      <DiscountManager discounts={(data ?? []) as Discount[]} />
    </div>
  );
}
