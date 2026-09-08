import { getBrevoListId } from "@/lib/brevo/subscribe";
import type { SiteId } from "@/lib/site/config";
import { SITES } from "@/lib/site/config";
import type { DateRange } from "@/lib/actions/finance";

export type BrevoSmtpTotals = {
  requests: number;
  delivered: number;
  uniqueOpens: number;
  uniqueClicks: number;
  hardBounces: number;
  softBounces: number;
  unsubscribed: number;
  spamReports: number;
};

export type BrevoDailyPoint = {
  day: string;
  requests: number;
  delivered: number;
  uniqueOpens: number;
  uniqueClicks: number;
};

export type BrevoCampaignRow = {
  id: number;
  name: string;
  subject: string;
  status: string;
  sentDate: string | null;
  sent: number;
  delivered: number;
  uniqueOpens: number;
  uniqueClicks: number;
  unsubscribed: number;
};

export type BrevoListRow = {
  siteId: SiteId;
  label: string;
  listId: number;
  subscribers: number;
  blacklisted: number;
};

export type BrevoAnalytics = {
  totals: BrevoSmtpTotals;
  daily: BrevoDailyPoint[];
  campaigns: BrevoCampaignRow[];
  lists: BrevoListRow[];
};

function asInt(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function ymd(iso: string): string {
  return iso.slice(0, 10);
}

async function brevoGet<T>(path: string): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: "BREVO_API_KEY is not set" };

  try {
    const response = await fetch(`https://api.brevo.com/v3${path}`, {
      headers: { accept: "application/json", "api-key": apiKey },
      cache: "no-store",
    });
    if (!response.ok) {
      let message = `Brevo ${response.status}`;
      try {
        const body = (await response.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // ignore
      }
      return { ok: false, error: message };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Brevo request failed" };
  }
}

type AggregatedReport = {
  requests?: number;
  delivered?: number;
  uniqueOpens?: number;
  uniqueClicks?: number;
  hardBounces?: number;
  softBounces?: number;
  unsubscribed?: number;
  spamReports?: number;
};

type ReportsBody = {
  reports?: Array<{
    date?: string;
    requests?: number;
    delivered?: number;
    uniqueOpens?: number;
    uniqueClicks?: number;
  }>;
};

type CampaignsBody = {
  campaigns?: Array<{
    id?: number;
    name?: string;
    subject?: string;
    status?: string;
    sentDate?: string;
    statistics?: {
      globalStats?: {
        sent?: number;
        delivered?: number;
        uniqueViews?: number;
        uniqueClicks?: number;
        unsubscriptions?: number;
      };
    };
  }>;
};

type ListBody = {
  id?: number;
  uniqueSubscribers?: number;
  totalSubscribers?: number;
  totalBlacklisted?: number;
};

export async function getBrevoAnalytics(
  range: DateRange,
  siteId?: SiteId,
): Promise<BrevoAnalytics | { error: string }> {
  const start = ymd(range.from);
  const end = ymd(range.to);
  const siteIds: SiteId[] = siteId ? [siteId] : ["verveace", "bleeq-ca"];

  const [agg, reports, campaigns, ...listResults] = await Promise.all([
    brevoGet<AggregatedReport>(
      `/smtp/statistics/aggregatedReport?startDate=${start}&endDate=${end}`,
    ),
    brevoGet<ReportsBody>(`/smtp/statistics/reports?startDate=${start}&endDate=${end}`),
    brevoGet<CampaignsBody>(
      `/emailCampaigns?limit=20&sort=desc&statistics=globalStats`,
    ),
    ...siteIds.map((id) => {
      const listId = getBrevoListId(id);
      if (listId === null) {
        return Promise.resolve({
          siteId: id,
          result: { ok: false as const, error: "list not configured" },
          listId: null as number | null,
        });
      }
      return brevoGet<ListBody>(`/contacts/lists/${listId}`).then((result) => ({
        siteId: id,
        result,
        listId,
      }));
    }),
  ]);

  if (!agg.ok) return { error: agg.error };

  const totals: BrevoSmtpTotals = {
    requests: asInt(agg.data.requests),
    delivered: asInt(agg.data.delivered),
    uniqueOpens: asInt(agg.data.uniqueOpens),
    uniqueClicks: asInt(agg.data.uniqueClicks),
    hardBounces: asInt(agg.data.hardBounces),
    softBounces: asInt(agg.data.softBounces),
    unsubscribed: asInt(agg.data.unsubscribed),
    spamReports: asInt(agg.data.spamReports),
  };

  const daily: BrevoDailyPoint[] = reports.ok
    ? (reports.data.reports ?? [])
        .map((row) => ({
          day: typeof row.date === "string" ? row.date : "",
          requests: asInt(row.requests),
          delivered: asInt(row.delivered),
          uniqueOpens: asInt(row.uniqueOpens),
          uniqueClicks: asInt(row.uniqueClicks),
        }))
        .filter((row) => row.day)
    : [];

  const campaignRows: BrevoCampaignRow[] = campaigns.ok
    ? (campaigns.data.campaigns ?? [])
        .map((c) => {
          const stats = c.statistics?.globalStats ?? {};
          return {
            id: typeof c.id === "number" ? c.id : 0,
            name: c.name?.trim() || "Untitled",
            subject: c.subject?.trim() || "—",
            status: c.status?.trim() || "unknown",
            sentDate: c.sentDate ?? null,
            sent: asInt(stats.sent),
            delivered: asInt(stats.delivered),
            uniqueOpens: asInt(stats.uniqueViews),
            uniqueClicks: asInt(stats.uniqueClicks),
            unsubscribed: asInt(stats.unsubscriptions),
          };
        })
        .filter((c) => c.id > 0)
    : [];

  const lists: BrevoListRow[] = [];
  for (const item of listResults) {
    if (item.listId === null || !item.result.ok) continue;
    lists.push({
      siteId: item.siteId,
      label: SITES[item.siteId].name,
      listId: item.listId,
      subscribers: asInt(
        item.result.data.uniqueSubscribers ?? item.result.data.totalSubscribers,
      ),
      blacklisted: asInt(item.result.data.totalBlacklisted),
    });
  }

  return { totals, daily, campaigns: campaignRows, lists };
}

export function ratePct(part: number, whole: number): string {
  if (whole <= 0) return "—";
  return `${((part / whole) * 100).toFixed(1)}%`;
}
