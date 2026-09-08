import { loadAdminProductInventory } from "./load-inventory";
import { ProductInventoryView } from "./ProductInventoryView";
import { requireAdminPage } from "@/lib/auth/admin";

export const metadata = { title: "Admin · Products" };

export default async function AdminProductsPage() {
  await requireAdminPage();
  const data = await loadAdminProductInventory();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      <ProductInventoryView data={data} />
    </div>
  );
}
