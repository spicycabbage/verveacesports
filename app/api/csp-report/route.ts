import { NextResponse, type NextRequest } from "next/server";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

// Receives Content-Security-Policy-Report-Only violation reports (see
// lib/security/csp.ts) and writes them to the server log so the policy can be
// tuned before enforcing. Browsers POST `application/csp-report` (report-uri) or
// `application/reports+json` (Reporting API).

const MAX_BODY_BYTES = 16 * 1024;

type CspReportBody = {
  "csp-report"?: Record<string, unknown>;
  body?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const limited = await rateLimit(`csp-report:${clientIp(request)}`, 30, 60_000);
  if (!limited.ok) return new NextResponse(null, { status: 429 });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });

  const raw = (await request.text()).slice(0, MAX_BODY_BYTES);
  let reports: Record<string, unknown>[] = [];
  try {
    const parsed = JSON.parse(raw) as CspReportBody | CspReportBody[];
    const list = Array.isArray(parsed) ? parsed : [parsed];
    reports = list
      .map((r) => r["csp-report"] ?? r.body)
      .filter((r): r is Record<string, unknown> => Boolean(r));
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  for (const report of reports) {
    console.warn(
      "[csp-report]",
      JSON.stringify({
        documentUri: report["document-uri"] ?? report.documentURL,
        violatedDirective: report["violated-directive"] ?? report.effectiveDirective,
        blockedUri: report["blocked-uri"] ?? report.blockedURL,
        sourceFile: report["source-file"] ?? report.sourceFile,
        line: report["line-number"] ?? report.lineNumber,
        sample: report["script-sample"] ?? report.sample,
        userAgent: request.headers.get("user-agent")?.slice(0, 160),
      }),
    );
  }

  return new NextResponse(null, { status: 204 });
}
