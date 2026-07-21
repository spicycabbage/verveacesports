import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ShippingSettings } from "./ShippingSettings";
import type { ShippingRateWithZone } from "@/lib/supabase/types";

export const metadata = { title: "Admin · Shipping" };

export default async function AdminShippingPage() {
  const admin = createSupabaseAdminClient();
  const { data: shippingRates } = await admin
    .from("shipping_rates")
    .select("*, shipping_zones!inner(name, countries)")
    .order("position", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shipping</h1>
        <p className="text-sm text-muted-foreground">
          Standard shipping fees for US & Canada checkout. Free-shipping threshold is based on cart
          subtotal before tax.
        </p>
      </div>
      <ShippingSettings rates={(shippingRates ?? []) as ShippingRateWithZone[]} />
    </div>
  );
}
