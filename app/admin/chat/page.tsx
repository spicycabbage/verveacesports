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
import { formatDate } from "@/lib/utils/format";
import type { ChatQuestion } from "@/lib/supabase/types";
import { ChatQuestionsToolbar } from "./ChatQuestionsToolbar";
import {
  ChatQuestionsPagination,
  CHAT_PAGE_SIZE,
} from "./ChatQuestionsPagination";

export const metadata = { title: "Admin · Chat" };

type SearchParams = Promise<{ site?: string; q?: string; page?: string }>;

function isSiteId(value: string | undefined): value is SiteId {
  return value === "verveace" || value === "bleeq-ca";
}

function siteLabel(siteId: SiteId): string {
  return SITES[siteId].name;
}

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const site = isSiteId(sp.site) ? sp.site : undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const from = (page - 1) * CHAT_PAGE_SIZE;
  const to = from + CHAT_PAGE_SIZE - 1;

  const admin = createSupabaseAdminClient();

  let countQuery = admin
    .from("chat_questions")
    .select("id", { count: "exact", head: true });
  if (site) countQuery = countQuery.eq("site_id", site);
  if (q) countQuery = countQuery.ilike("question", `%${q}%`);

  const { count: totalCount, error: countError } = await countQuery;
  const total = totalCount ?? 0;

  let listQuery = admin
    .from("chat_questions")
    .select(
      "id, site_id, question, locale, country, currency, user_id, message_count, created_at",
    )
    .order("created_at", { ascending: false })
    .range(from, to);
  if (site) listQuery = listQuery.eq("site_id", site);
  if (q) listQuery = listQuery.ilike("question", `%${q}%`);

  const { data, error } = await listQuery;
  const rows = (data ?? []) as ChatQuestion[];
  const loadError = error?.message ?? countError?.message;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chat questions</h1>
        <p className="text-sm text-muted-foreground">
          Questions shoppers submitted to the support chatbots, by property.
        </p>
      </div>

      <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}>
        <ChatQuestionsToolbar />
      </Suspense>

      {loadError ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            Could not load chat questions: {loadError}
            {loadError.includes("chat_questions") || loadError.includes("does not exist")
              ? " — apply migration 0031_chat_questions.sql in Supabase."
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
                    <TableHead className="w-[140px]">When</TableHead>
                    <TableHead className="w-[140px]">Property</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead className="w-[90px]">Locale</TableHead>
                    <TableHead className="w-[90px]">Market</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="align-top text-muted-foreground whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant={row.site_id === "bleeq-ca" ? "secondary" : "default"}
                        >
                          {siteLabel(row.site_id)}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top whitespace-normal">
                        <p className="max-w-xl text-sm leading-relaxed">{row.question}</p>
                      </TableCell>
                      <TableCell className="align-top text-muted-foreground">
                        {row.locale ?? "—"}
                      </TableCell>
                      <TableCell className="align-top text-muted-foreground">
                        {row.country && row.currency
                          ? `${row.country} · ${row.currency}`
                          : (row.country ?? row.currency ?? "—")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        {site || q
                          ? "No questions match your filters."
                          : "No chat questions logged yet."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <ChatQuestionsPagination page={page} total={total} site={site} q={q} />
        </>
      )}
    </div>
  );
}
