import { Suspense } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SITES, type SiteId } from "@/lib/site/config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateOnly } from "@/lib/utils/format";
import type { WarrantyRegistration } from "@/lib/supabase/types";
import { WarrantyToolbar } from "./WarrantyToolbar";
import { WarrantyPagination, WARRANTY_PAGE_SIZE } from "./WarrantyPagination";

export const metadata = { title: "Admin · Warranty" };

type SearchParams = Promise<{ site?: string; q?: string; page?: string }>;

function isSiteId(value: string | undefined): value is SiteId {
  return value === "verveace" || value === "bleeq-ca";
}

function siteLabel(siteId: string): string {
  if (isSiteId(siteId)) return SITES[siteId].name;
  return siteId;
}

export default async function AdminWarrantyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const site = isSiteId(sp.site) ? sp.site : undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const from = (page - 1) * WARRANTY_PAGE_SIZE;
  const to = from + WARRANTY_PAGE_SIZE - 1;

  const admin = createSupabaseAdminClient();

  let countQuery = admin
    .from("warranty_registrations")
    .select("id", { count: "exact", head: true });
  if (site) countQuery = countQuery.eq("site_id", site);
  if (q) {
    countQuery = countQuery.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,order_number.ilike.%${q}%,serial_number.ilike.%${q}%,product_label.ilike.%${q}%`,
    );
  }

  const { count: totalCount, error: countError } = await countQuery;
  const total = totalCount ?? 0;

  let listQuery = admin
    .from("warranty_registrations")
    .select(
      "id, site_id, full_name, email, order_number, product_slug, product_label, serial_number, purchase_date, notes, created_at",
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  if (site) listQuery = listQuery.eq("site_id", site);
  if (q) {
    listQuery = listQuery.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,order_number.ilike.%${q}%,serial_number.ilike.%${q}%,product_label.ilike.%${q}%`,
    );
  }

  const { data, error } = await listQuery;
  const rows = (data ?? []) as WarrantyRegistration[];
  const loadError = error?.message ?? countError?.message;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Warranty registrations</h1>
        <p className="text-sm text-muted-foreground">
          Product warranty registrations submitted from the storefront, by property.
        </p>
      </div>

      <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}>
        <WarrantyToolbar />
      </Suspense>

      {loadError ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            Could not load warranty registrations: {loadError}
            {loadError.includes("warranty_registrations") ||
            loadError.includes("does not exist")
              ? " — apply migration 0034_warranty_registrations.sql in Supabase."
              : null}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[130px]">Property</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-[120px]">Order #</TableHead>
                    <TableHead className="w-[110px]">Serial</TableHead>
                    <TableHead className="w-[110px]">Purchased</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="align-top whitespace-nowrap text-muted-foreground">
                        {formatDateOnly(row.created_at)}
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant={row.site_id === "bleeq-ca" ? "secondary" : "default"}
                        >
                          {siteLabel(row.site_id)}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <p className="text-sm font-medium">{row.full_name}</p>
                        <a
                          href={`mailto:${row.email}`}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {row.email}
                        </a>
                        {row.notes ? (
                          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                            {row.notes}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="align-top text-sm">{row.product_label}</TableCell>
                      <TableCell className="align-top font-mono text-xs">
                        {row.order_number}
                      </TableCell>
                      <TableCell className="align-top font-mono text-xs text-muted-foreground">
                        {row.serial_number ?? "—"}
                      </TableCell>
                      <TableCell className="align-top whitespace-nowrap text-muted-foreground">
                        {row.purchase_date ? formatDateOnly(row.purchase_date) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        {site || q
                          ? "No registrations match your filters."
                          : "No warranty registrations yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <WarrantyPagination page={page} total={total} site={site} q={q} />
        </>
      )}
    </div>
  );
}
