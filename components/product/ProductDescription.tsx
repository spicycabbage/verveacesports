import { parseDescription } from "@/lib/catalog/description";

export function ProductDescription({ text }: { text: string | null | undefined }) {
  const blocks = parseDescription(text);
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            return (
              <h2 key={i} className="pt-2 text-base font-semibold text-foreground">
                {block.text}
              </h2>
            );
          case "paragraph":
            return <p key={i}>{block.text}</p>;
          case "list":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            );
          default: {
            const _exhaustive: never = block;
            return _exhaustive;
          }
        }
      })}
    </div>
  );
}
