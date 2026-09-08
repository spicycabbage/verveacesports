import { brandLogoImageResponse } from "@/lib/site/logo-icon";
import { getSite } from "@/lib/site/get-site";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const site = await getSite();
  return brandLogoImageResponse(site.id, size.width);
}
