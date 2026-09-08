"use server";

import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

const PRODUCT_IMAGE_BUCKET = "product-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
/** Raster only. SVG is scriptable → stored XSS on a public bucket. */
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
/** Paths are UUIDs, never overwritten — safe to cache forever at the CDN. */
const STORAGE_CACHE_CONTROL = String(60 * 60 * 24 * 365);

type Prepared = { buffer: Buffer; contentType: string; ext: string };

/** Magic-byte sniff so a renamed file can't spoof `file.type` (client-supplied). */
function sniffRasterMime(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  const gif = buf.subarray(0, 6).toString("ascii");
  if (gif === "GIF87a" || gif === "GIF89a") return "image/gif";
  return null;
}

/**
 * sharp is a native module. On Vercel its linux libvips binary is sometimes
 * missing from the traced bundle, and a static import would throw at module
 * load — taking down every action in the same file. Keep it isolated here and
 * load it lazily. (Documented exception to the no-inline-imports rule.)
 *
 * Fails closed: if sharp can't process the file we reject the upload rather
 * than storing an unverified original on a public bucket.
 */
async function prepareImage(input: Buffer, mimeType: string): Promise<Prepared | null> {
  try {
    const { optimizeUploadImage } = await import("@/lib/images/optimize-upload");
    return await optimizeUploadImage(input, mimeType);
  } catch (err) {
    console.error("[upload-image] sharp failed to process upload", err);
    return null;
  }
}

export async function uploadProductImage(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const guard = await requireAdmin();
  if (!guard.ok) return { error: guard.error };

  const productId = formData.get("productId");
  const file = formData.get("file");
  if (typeof productId !== "string" || !z.string().uuid().safeParse(productId).success) {
    return { error: "Invalid product" };
  }
  if (!(file instanceof File) || file.size === 0) return { error: "No file selected" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image must be 5 MB or smaller" };
  if (!ALLOWED_MIME.has(file.type)) return { error: "Use a JPEG, PNG, WebP, or GIF image" };

  const input = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffRasterMime(input);
  if (!sniffed || !ALLOWED_MIME.has(sniffed)) {
    return { error: "File contents don't look like a JPEG, PNG, WebP, or GIF" };
  }

  const prepared = await prepareImage(input, sniffed);
  if (!prepared) return { error: "Could not process this image — try re-exporting it" };

  const admin = createSupabaseAdminClient();
  const path = `${productId}/${crypto.randomUUID()}.${prepared.ext}`;
  const { error: uploadError } = await admin.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, prepared.buffer, {
      contentType: prepared.contentType,
      cacheControl: STORAGE_CACHE_CONTROL,
      upsert: false,
    });
  if (uploadError) {
    return {
      error: uploadError.message.includes("Bucket not found")
        ? "Storage bucket product-images is missing — run migration 0007 or create the bucket in Supabase Storage"
        : uploadError.message,
    };
  }

  const { data: urlData } = admin.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return { url: urlData.publicUrl };
}
