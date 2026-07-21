import { redirect } from "next/navigation";

export default function AdminCatalogRedirect() {
  redirect("/admin/products");
}
