import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { warrantyProductOptions } from "@/lib/content/warranty";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(body: unknown, key: string, max: number): string | null {
  if (typeof body !== "object" || body === null || !(key in body)) return null;
  const v = (body as Record<string, unknown>)[key];
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t || t.length > max) return null;
  return t;
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(`warranty:${clientIp(request)}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts, try again shortly" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const site = getSiteFromRequest(request);
  const options = warrantyProductOptions(site);

  const fullName = str(body, "fullName", 120);
  const emailRaw = str(body, "email", 320);
  const orderNumber = str(body, "orderNumber", 64);
  const productSlug = str(body, "productSlug", 120);
  const serialNumber = str(body, "serialNumber", 120);
  const purchaseDate = str(body, "purchaseDate", 32);
  const notes = str(body, "notes", 2000);

  const email = emailRaw?.toLowerCase() ?? null;
  if (!fullName || !email || !EMAIL_RE.test(email) || !orderNumber || !productSlug) {
    return NextResponse.json(
      { error: "Name, email, order number, and product are required" },
      { status: 400 },
    );
  }

  const product = options.find((o) => o.value === productSlug);
  if (!product) {
    return NextResponse.json({ error: "Select a valid product" }, { status: 400 });
  }

  let purchaseDateIso: string | null = null;
  if (purchaseDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
      return NextResponse.json({ error: "Invalid purchase date" }, { status: 400 });
    }
    purchaseDateIso = purchaseDate;
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("warranty_registrations").insert({
    site_id: site.id,
    full_name: fullName,
    email,
    order_number: orderNumber,
    product_slug: product.value,
    product_label: product.label,
    serial_number: serialNumber,
    purchase_date: purchaseDateIso,
    notes,
  });

  if (error) {
    console.error("warranty registration insert failed:", error.message);
    return NextResponse.json(
      { error: "Could not save registration. Try again." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
