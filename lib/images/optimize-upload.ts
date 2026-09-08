import sharp from "sharp";

const MAX_EDGE = 1600;
const WEBP_QUALITY = 82;

/** Normalize admin uploads so the stored file is never a multi‑MB PNG. */
export async function optimizeUploadImage(
  input: Buffer,
  mimeType: string,
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  if (mimeType === "image/gif") {
    // Re-encode (keeps animation) so a malformed/polyglot file never lands in storage as-is.
    const buffer = await sharp(input, { animated: true }).gif().toBuffer();
    return { buffer, contentType: "image/gif", ext: "gif" };
  }

  // `.rotate()` applies EXIF orientation; re-encoding drops EXIF/GPS metadata.
  const buffer = await sharp(input)
    .rotate()
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return { buffer, contentType: "image/webp", ext: "webp" };
}
