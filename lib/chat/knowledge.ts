import { FAQ_SECTIONS } from "@/lib/content/faq";

/** Flatten FAQ content for the assistant system prompt. */
export function buildFaqKnowledge(): string {
  return FAQ_SECTIONS.map((section) => {
    const items = section.items
      .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
      .join("\n\n");
    return `## ${section.title}\n\n${items}`;
  }).join("\n\n");
}
