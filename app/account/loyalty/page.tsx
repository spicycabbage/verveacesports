import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPoints } from "@/lib/utils/format";
import { Sparkles } from "lucide-react";
import type { LoyaltyTransaction, LoyaltyTxType } from "@/lib/supabase/types";

export const metadata = { title: "Loyalty points" };

const TYPE_LABEL: Record<LoyaltyTxType, string> = {
  earn_purchase: "Purchase",
  earn_referral: "Referral bonus",
  redeem: "Redeemed",
  adjust: "Adjustment",
};

export default async function LoyaltyPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("loyalty_points")
    .eq("id", user!.id)
    .single<{ loyalty_points: number }>();

  const { data: txs } = await supabase
    .from("loyalty_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const transactions = (txs ?? []) as LoyaltyTransaction[];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-0 pb-2">
          <CardDescription className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Current balance
          </CardDescription>
          <CardTitle className="text-4xl tabular-nums">
            {formatPoints(profile?.loyalty_points ?? 0)} pts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Worth ${((profile?.loyalty_points ?? 0) / 100).toFixed(2)} at checkout. 100 pts = $1.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Recent loyalty activity.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground">{formatDate(t.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{TYPE_LABEL[t.type]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t.note ?? ""}</TableCell>
                    <TableCell
                      className={`text-right font-semibold tabular-nums ${
                        t.points >= 0 ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {t.points >= 0 ? "+" : ""}
                      {formatPoints(t.points)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
