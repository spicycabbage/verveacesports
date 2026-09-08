import { Suspense } from "react";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminNav } from "./AdminNav";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guards the chrome only — every admin page calls requireAdminPage() itself
  // (page segments render in parallel with this layout).
  await requireAdminPage();

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[200px_1fr] print:block print:max-w-none print:px-0 print:py-0">
      <AdminNav />
      <section className="min-w-0 print:max-w-none">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
          {children}
        </Suspense>
      </section>
    </div>
  );
}
