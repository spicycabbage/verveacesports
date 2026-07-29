import { Suspense, type ReactNode } from "react";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
import { countryName } from "@/lib/constants";
import type { SiteId } from "@/lib/site/config";
import type { Profile } from "@/lib/supabase/types";
import { UsersToolbar } from "./UsersToolbar";
import { DeleteUserButton } from "./DeleteUserButton";

export const metadata = { title: "Admin · Users" };

type SearchParams = Promise<{ filter?: string }>;

type ListRow = {
  kind: "account" | "lead";
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  country: Profile["country"] | null;
  loyalty_points: number;
  is_admin: boolean;
  site_id: SiteId;
  paid_order_count: number;
  created_at: string;
  source: string | null;
};

function isSiteId(value: string | undefined | null): value is SiteId {
  return value === "verveace" || value === "bleeq-ca";
}

function originLabel(siteId: SiteId): string {
  return siteId === "bleeq-ca" ? "BUC" : "VAS";
}

function displayName(row: ListRow): string {
  const parts = [row.first_name, row.last_name].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return row.full_name?.trim() || row.email || "—";
}

function sourceLabel(source: string | null): string {
  if (!source) return "Lead";
  if (source.includes("draw")) return "Draw";
  if (source.includes("popup")) return "Newsletter";
  if (source.includes("signup")) return "Signup list";
  return "Lead";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filter = sp.filter === "buyers" || sp.filter === "leads" ? sp.filter : null;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: actor },
  } = await supabase.auth.getUser();

  const admin = createSupabaseAdminClient();

  // Prefer orders.site_id when migration 0033 is applied; fall back otherwise.
  let orderRows:
    | {
        user_id: string | null;
        site_id?: string | null;
        created_at: string;
        financial_status: string;
      }[]
    | null = null;

  const ordersWithSite = await admin
    .from("orders")
    .select("user_id, site_id, created_at, financial_status")
    .not("user_id", "is", null)
    .order("created_at", { ascending: true });

  if (ordersWithSite.error?.message?.includes("site_id")) {
    const ordersWithoutSite = await admin
      .from("orders")
      .select("user_id, created_at, financial_status")
      .not("user_id", "is", null)
      .order("created_at", { ascending: true });
    orderRows = ordersWithoutSite.data;
  } else {
    orderRows = ordersWithSite.data;
  }

  const orderCountByUser = new Map<string, number>();
  const originByUser = new Map<string, SiteId>();
  for (const row of orderRows ?? []) {
    if (!row.user_id) continue;
    if (!originByUser.has(row.user_id) && isSiteId(row.site_id)) {
      originByUser.set(row.user_id, row.site_id);
    }
    if (
      row.financial_status === "paid" ||
      row.financial_status === "partially_refunded" ||
      row.financial_status === "refunded"
    ) {
      orderCountByUser.set(row.user_id, (orderCountByUser.get(row.user_id) ?? 0) + 1);
    }
  }

  let profiles:
    | {
        id: string;
        email: string;
        first_name: string | null;
        last_name: string | null;
        full_name: string | null;
        country: Profile["country"];
        loyalty_points: number;
        is_admin: boolean;
        created_at: string;
        site_id?: string | null;
      }[]
    | null = null;
  let loadError: string | undefined;

  const withSite = await admin
    .from("profiles")
    .select(
      "id, email, first_name, last_name, full_name, country, loyalty_points, is_admin, site_id, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (withSite.error?.message?.includes("site_id")) {
    const withoutSite = await admin
      .from("profiles")
      .select(
        "id, email, first_name, last_name, full_name, country, loyalty_points, is_admin, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    profiles = withoutSite.data;
    loadError = withoutSite.error?.message;
  } else {
    profiles = withSite.data;
    loadError = withSite.error?.message;
  }

  const accountEmails = new Set(
    (profiles ?? []).map((p) => p.email.trim().toLowerCase()).filter(Boolean),
  );

  const { data: leads, error: leadsError } = await admin
    .from("newsletter_subscribers")
    .select("id, email, source, site_id, subscribed_at")
    .order("subscribed_at", { ascending: false })
    .limit(500);
  if (leadsError && !loadError) loadError = leadsError.message;

  const accountRows: ListRow[] = (profiles ?? []).map((row) => ({
    kind: "account",
    id: row.id,
    email: row.email,
    first_name: row.first_name,
    last_name: row.last_name,
    full_name: row.full_name,
    country: row.country,
    loyalty_points: row.loyalty_points,
    is_admin: row.is_admin,
    site_id: isSiteId(row.site_id)
      ? row.site_id
      : (originByUser.get(row.id) ?? "verveace"),
    paid_order_count: orderCountByUser.get(row.id) ?? 0,
    created_at: row.created_at,
    source: null,
  }));

  const leadRows: ListRow[] = (leads ?? [])
    .filter((row) => !accountEmails.has(row.email.trim().toLowerCase()))
    .map((row) => ({
      kind: "lead" as const,
      id: row.id,
      email: row.email,
      first_name: null,
      last_name: null,
      full_name: null,
      country: null,
      loyalty_points: 0,
      is_admin: false,
      site_id: isSiteId(row.site_id) ? row.site_id : "verveace",
      paid_order_count: 0,
      created_at: row.subscribed_at,
      source: row.source,
    }));

  let rows: ListRow[] = [...accountRows, ...leadRows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  if (filter === "buyers") {
    rows = rows.filter((row) => row.kind === "account" && row.paid_order_count > 0);
  } else if (filter === "leads") {
    rows = rows.filter((row) => row.kind === "lead");
  }

  return (
    <UsersPageShell>
      {loadError ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            Could not load users: {loadError}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[88px] text-right">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const name = displayName(row);
                  const isSelf = row.kind === "account" && actor?.id === row.id;
                  return (
                    <TableRow key={`${row.kind}-${row.id}`}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{name}</span>
                          {row.is_admin ? (
                            <Badge variant="secondary">Admin</Badge>
                          ) : null}
                          {row.kind === "lead" ? (
                            <Badge variant="outline">{sourceLabel(row.source)}</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.email}</TableCell>
                      <TableCell>
                        <Badge variant={row.site_id === "bleeq-ca" ? "secondary" : "default"}>
                          {originLabel(row.site_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.country ? countryName(row.country) : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.paid_order_count}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.loyalty_points}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDateOnly(row.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteUserButton
                          kind={row.kind}
                          id={row.id}
                          label={name}
                          disabled={isSelf}
                          disabledReason="You can’t delete your own account"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      {filter === "buyers"
                        ? "No verified buyers yet."
                        : filter === "leads"
                          ? "No draw / newsletter leads yet."
                          : "No users yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </UsersPageShell>
  );
}

function UsersPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Users</h1>
      <Suspense fallback={<div className="h-9 animate-pulse rounded-lg bg-muted" />}>
        <UsersToolbar />
      </Suspense>
      {children}
    </div>
  );
}
