import { redirect } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function AdminCatalogEditRedirect({ params }: { params: Params }) {
  const { id } = await params;
  redirect(`/admin/products/${id}`);
}
