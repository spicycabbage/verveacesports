import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { xai } from "@ai-sdk/xai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { buildChatSystemPrompt } from "@/lib/chat/system-prompt";
import {
  extractLatestUserQuestion,
  logChatQuestion,
} from "@/lib/chat/log-question";
import { COUNTRIES } from "@/lib/constants";
import { MARKET_COOKIE, parseMarketCookie } from "@/lib/geo/market";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY_BYTES = 64 * 1024;
const MAX_MESSAGES = 40;

export async function POST(req: NextRequest) {
  if (!process.env.XAI_API_KEY) {
    return NextResponse.json(
      { error: "Chat is not configured" },
      { status: 503 },
    );
  }

  const limited = rateLimit(`chat:${clientIp(req)}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests, slow down" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  let json: unknown = null;
  try {
    json = JSON.parse(rawBody);
  } catch {
    json = null;
  }
  const messages = (json as { messages?: UIMessage[] } | null)?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const locale = parseLocaleCookie(cookieStore.get(LOCALE_COOKIE)?.value);
  const site = getSiteFromRequest(req);
  const country =
    site.lockMarket ?? parseMarketCookie(cookieStore.get(MARKET_COOKIE)?.value);
  const currency = COUNTRIES[country].currency;

  const question = extractLatestUserQuestion(messages);
  if (question) {
    let userId: string | null = null;
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      userId = null;
    }
    void logChatQuestion({
      siteId: site.id,
      question,
      locale,
      country,
      currency,
      userId,
      messageCount: messages.length,
    });
  }

  const result = streamText({
    model: xai("grok-4.20-reasoning"),
    system: buildChatSystemPrompt({
      locale,
      currency,
      country,
      siteId: site.id,
    }),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
