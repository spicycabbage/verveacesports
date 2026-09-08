import { cache } from "react";
import { headers } from "next/headers";

export const getRequestPathname = cache(async (): Promise<string> => {
  const h = await headers();
  return h.get("x-pathname") ?? "";
});

export async function isAdminPath(): Promise<boolean> {
  const pathname = await getRequestPathname();
  return pathname.startsWith("/admin");
}
