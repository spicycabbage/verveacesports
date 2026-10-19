export type DescriptionBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

export type DescriptionFaq = { question: string; answer: string };

/**
 * Admin-authored product copy. `### ` starts a heading, `- ` lines form a
 * list, everything else is plain text (no inline markup, never HTML).
 * A heading ending in "?" plus the blocks under it is a FAQ entry.
 */
export function parseDescription(raw: string | null | undefined): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ kind: "list", items: list });
    list = [];
  };

  for (const rawLine of (raw ?? "").replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
    } else if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "heading", text: line.slice(4).trim() });
    } else if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2).trim());
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

function blockText(block: DescriptionBlock): string {
  switch (block.kind) {
    case "heading":
    case "paragraph":
      return block.text;
    case "list":
      return `${block.items.join("; ")}.`;
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

/** Marker-free copy for meta descriptions and Product JSON-LD. */
export function descriptionPlainText(raw: string | null | undefined): string {
  return parseDescription(raw).map(blockText).join(" ");
}

export function descriptionFaq(raw: string | null | undefined): DescriptionFaq[] {
  const faq: DescriptionFaq[] = [];
  let current: { question: string; answer: string[] } | null = null;

  const flush = () => {
    if (current && current.answer.length) {
      faq.push({ question: current.question, answer: current.answer.join(" ") });
    }
    current = null;
  };

  for (const block of parseDescription(raw)) {
    if (block.kind === "heading") {
      flush();
      if (block.text.endsWith("?")) current = { question: block.text, answer: [] };
    } else if (current) {
      current.answer.push(blockText(block));
    }
  }
  flush();
  return faq;
}
