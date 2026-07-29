import type { UIMessage } from "ai";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SiteId } from "@/lib/site/config";

function textFromParts(parts: UIMessage["parts"] | undefined): string {
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("")
    .trim();
}

/** Latest user turn in a chat request (what the shopper just asked). */
export function extractLatestUserQuestion(messages: UIMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== "user") continue;
    const text = textFromParts(message.parts);
    if (text) return text.slice(0, 8000);
  }
  return null;
}

export async function logChatQuestion(input: {
  siteId: SiteId;
  question: string;
  locale: string;
  country: "US" | "CA";
  currency: "USD" | "CAD";
  userId?: string | null;
  messageCount: number;
}): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("chat_questions").insert({
      site_id: input.siteId,
      question: input.question,
      locale: input.locale,
      country: input.country,
      currency: input.currency,
      user_id: input.userId ?? null,
      message_count: input.messageCount,
    });
    if (error) {
      console.error("chat_questions insert failed:", error.message);
    }
  } catch (err) {
    console.error("chat_questions insert failed:", err);
  }
}
