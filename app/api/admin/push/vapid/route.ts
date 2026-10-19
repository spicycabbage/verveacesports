import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { vapidPublicKey } from "@/lib/admin/web-push";

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const publicKey = vapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ error: "Push is not configured" }, { status: 503 });
  }
  return NextResponse.json({ publicKey });
}
