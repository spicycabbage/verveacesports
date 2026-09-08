import { cacheLife, cacheTag } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LOCATIONS_TAG } from "@/lib/catalog/tags";

export async function getDefaultLocation(): Promise<{ id: string; name: string } | null> {
  "use cache";
  cacheTag(LOCATIONS_TAG);
  cacheLife("hours");

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("locations")
    .select("id, name")
    .eq("is_default", true)
    .maybeSingle();
  return (data as { id: string; name: string } | null) ?? null;
}
