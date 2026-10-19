import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  token: z
    .string()
    .min(20)
    .max(200)
    .regex(/^(ExponentPushToken\[.+\]|ExpoPushToken\[.+\])$/),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid Expo token" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("admin_expo_push_tokens").upsert(
    {
      user_id: guard.userId,
      token: parsed.data.token,
    },
    { onConflict: "token" },
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
