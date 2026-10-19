import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { countUnfulfilledPaidOrders } from "@/lib/admin/order-alerts";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const count = await countUnfulfilledPaidOrders(createSupabaseAdminClient());
  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
