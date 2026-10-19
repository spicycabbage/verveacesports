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
import { detectCustomerLocale } from "@/lib/chat/reply-language";
import { MARKET_COOKIE, parseMarketCookie } from "@/lib/geo/market";
import { LOCALE_COOKIE, parseLocaleCookie } from "@/lib/i18n/locale";
import { getSiteFromRequest } from "@/lib/site/get-site";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/utils/rate-limit";

export const maxDuration = 30;

const MAX_BODY_BYTES = 64 * 1024;
const MAX_MESSAGES = 40;
/** Per-message cap — the 64KB body cap alone still allows one giant prompt. */
const MAX_MESSAGE_CHARS = 4_000;
/** Support answers are short; bounds spend per request on an unauthenticated endpoint. */
const MAX_OUTPUT_TOKENS = 1_024;

function messageChars(message: UIMessage): number {
  return message.parts.reduce(
    (n, part) => n + (part.type === "text" ? part.text.length : 0),
    0,
  );
}

export async function POST(req: NextRequest) {
  if (!process.env.XAI_API_KEY) {
    return NextResponse.json(
      { error: "Chat is not configured" },
      { status: 503 },
    );
  }

  const limited = await rateLimit(`chat:${clientIp(req)}`, 20, 60_000);
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
  if (messages.some((m) => !Array.isArray(m?.parts) || messageChars(m) > MAX_MESSAGE_CHARS)) {
    return NextResponse.json({ error: "Message too long" }, { status: 413 });
  }

  const cookieStore = await cookies();
  const bodyLocale =
    typeof json === "object" &&
    json !== null &&
    "locale" in json &&
    typeof (json as { locale: unknown }).locale === "string"
      ? (json as { locale: string }).locale
      : null;
  const locale = parseLocaleCookie(bodyLocale ?? cookieStore.get(LOCALE_COOKIE)?.value);
  const site = getSiteFromRequest(req);
  const country =
    site.lockMarket ?? parseMarketCookie(cookieStore.get(MARKET_COOKIE)?.value);
  const currency = "CAD" as const;

  const question = extractLatestUserQuestion(messages);
  const customerLocale = detectCustomerLocale(question ?? "", locale);
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
    system: await buildChatSystemPrompt({
      locale,
      customerLocale,
      latestMessage: question,
      currency,
      country,
      siteId: site.id,
    }),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
