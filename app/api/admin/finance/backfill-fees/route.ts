import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { backfillOrderFees } from "@/lib/stripe/reconcile";

/** Admin: re-sync Stripe fees for succeeded payments missing BT rows. */
export async function POST() {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const result = await backfillOrderFees(createSupabaseAdminClient());
  return NextResponse.json(result);
}
