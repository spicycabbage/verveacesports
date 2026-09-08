import { loadAdminProductInventory } from "@/app/admin/products/load-inventory";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loadPosSettings } from "@/lib/pos/settings";
import { PosClient } from "./PosClient";
import { requireAdminPage } from "@/lib/auth/admin";

export const metadata = { title: "Admin · POS" };

export default async function AdminPosPage() {
  await requireAdminPage();
  const admin = createSupabaseAdminClient();
  const [catalog, settings] = await Promise.all([
    loadAdminProductInventory(),
    loadPosSettings(admin),
  ]);

  return (
    <PosClient
      products={catalog.products.filter((p) => p.isActive)}
      catalogError={catalog.error}
      settings={settings}
    />
  );
}
